var FVArrayRuleField = (function(){

    var _FieldVal;
    if(this.FieldVal !== undefined){
        _FieldVal = this.FieldVal;
    } else if((typeof require) === 'function'){
        _FieldVal = require('fieldval');
    } else {
        throw new Error("FieldVal Rules requires FieldVal");
    }
    var FieldVal = _FieldVal;
    var BasicVal = FieldVal.BasicVal;

    var _FVRuleField;
    if(this.FVRuleField !== undefined){
        _FVRuleField = this.FVRuleField;
    } else if((typeof require) === 'function'){
        _FVRuleField = require('./FVRuleField');    
    } else {
        throw new Error("FVRuleField is missing");
    }
    var FVRuleField = _FVRuleField;

    var _fieldval_rules_extend;
    if(this.fieldval_rules_extend !== undefined){
        _fieldval_rules_extend = this.fieldval_rules_extend;
    } else if((typeof require) === 'function'){
        _fieldval_rules_extend = require('../fieldval_rules_extend');
    } else {
        throw new Error("fieldval_rules_extend() is missing");
    }
    var fieldval_rules_extend = _fieldval_rules_extend;

    fieldval_rules_extend(FVArrayRuleField, FVRuleField);

    function FVArrayRuleField(json, validator) {
        var field = this;

        FVArrayRuleField.superConstructor.call(this, json, validator);

        field.rules = [];
        field.fields = [];
        field.indices = {};
        field.interval = null;
        field.interval_offsets = [];
    }

    FVArrayRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVArrayField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form
        });
        field.ui_field.new_field = function(index){
            return field.new_field(index);
        }
        var original_remove_field = field.ui_field.remove_field;
        field.ui_field.remove_field = function(inner_field){
            for(var i = 0; i < field.fields.length; i++){
                if(field.fields[i]===inner_field){
                    field.fields.splice(i,1);
                }
            }
            return original_remove_field.call(field.ui_field, inner_field);
        }
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVArrayRuleField.prototype.new_field = function(index){
        var field = this;

        var rule = field.rule_for_index(index);
        
        return rule.create_ui();
    }

    FVArrayRuleField.prototype.rule_for_index = function(index){
        var field = this;

        var rule = field.rules[index];
        if(!rule){
            var rule_json = field.rule_json_for_index(index);
            var field_creation = FVRuleField.create_field(rule_json);
            var err = field_creation[0];
            rule = field_creation[1];
            field.rules[index] = rule;
        }
        return rule;
    }

    FVArrayRuleField.prototype.rule_json_for_index = function(index){
        var field = this;

        var rule_json = field.indices[index];
        if(!rule_json){
            if(field.interval){
                var offset = index % field.interval;
                rule_json = field.interval_offsets[offset];
            }
        }
        if(!rule_json){
            rule_json = field.indices["*"];
        }

        return rule_json;
    }

    FVArrayRuleField.integer_regex = /^(\d+)$/;
    FVArrayRuleField.interval_regex = /^(\d+)n(\+(\d+))?$/;
    FVArrayRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.array(field.required));

        field.min_length = field.validator.get("min_length", BasicVal.integer(false), BasicVal.minimum(0));
        if(field.min_length !== undefined){
            field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
        }

        field.max_length = field.validator.get("max_length", BasicVal.integer(false), BasicVal.minimum(0), function(value){
            if(field.min_length!==undefined && value<field.min_length){
                return FVRuleField.errors.max_length_not_greater_than_min_length();
            }
        });
        if(field.max_length !== undefined){
            field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
        }

        var indices_json = field.validator.get("indices", BasicVal.object(false));

        if (indices_json != null) {
            var indices_validator = new FieldVal(null);

            for(var index_string in indices_json){
            	var field_json = indices_json[index_string];

                //FVRuleField is created to validate properties, not to use
            	var field_creation = FVRuleField.create_field(field_json);
                var err = field_creation[0];

                if(err!=null){
                    indices_validator.invalid(index_string,err);
                    continue;
                }

                var interval_match = index_string.match(FVArrayRuleField.interval_regex);
                if(interval_match){
                    //Matched
                    var interval = interval_match[1];
                    var offset = interval_match[3] || 0;
                    if(field.interval && interval!==field.interval){
                        indices_validator.invalid(
                            index_string,
                            FVRuleField.errors.interval_conflict(interval,field.interval)
                        );
                        continue;   
                    }
                    field.interval = interval;
                    if(field.interval_offsets[offset]!==undefined){
                        indices_validator.invalid(
                            index_string,
                            FVRuleField.errors.index_already_present()
                        );
                    }
                    field.interval_offsets[offset] = field_json;
                } else {
                    var integer_match = index_string.match(FVArrayRuleField.integer_regex);
                    if(integer_match){
                        var integer_index = integer_match[1];
                        field.indices[integer_index] = field_json;
                    } else if(index_string==='*'){
                        field.indices['*'] = field_json;
                    } else {
                        indices_validator.invalid(
                            index_string,
                            FVRuleField.errors.invalid_indices_format
                        );
                    }
                }
            }

            var indices_error = indices_validator.end();
            if(indices_error){
                field.validator.invalid("indices", indices_error)
            } else {

                if(!field.indices['*']){
                    //Doesn't have wildcard - must check that indices pattern is complete

                    var missing = [];

                    if(field.max_length!==undefined){
                        for(var i = 0; i < field.max_length; i++){
                            if(!field.rule_json_for_index(i)){
                                missing.push(i);
                            }
                        }
                    } else {

                        if(field.interval){
                            for(var i = 0; i < field.interval; i++){
                                if(field.interval_offsets[i]===undefined){
                                    missing.push(field.interval+"n"+(i===0?"":"+"+i));
                                }
                            }
                        } else {
                            //Doesn't have an interval - no patterns
                            field.validator.invalid("indices", FVRuleField.errors.incomplete_indicies());    
                        }
                    }

                    if(missing.length>0){
                        field.validator.invalid("indices", FVRuleField.errors.incomplete_indicies(missing));
                    }
                }
            }
        }

        field.checks.push(function(value,emit){

            var array_validator = new FieldVal(value);

            for(var i = 0; i < value.length; i++){
                var rule = field.rule_for_index(i);

                rule.validate_as_field(i, array_validator);
            }

            var array_error = array_validator.end();

            return array_error;
        });

        return field.validator.end();
    }

    FVArrayRuleField.add_editor_params = function(editor) {
        var field = this;

        var value = editor.val();

        var indices = new FVKeyValueField("Indices");
        indices.new_field = function() {
            return new editor.constructor(null, editor);
        }
        indices.val(value.indices);

        editor.add_field("indices", indices);

    }

    return FVArrayRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVArrayRuleField;
}