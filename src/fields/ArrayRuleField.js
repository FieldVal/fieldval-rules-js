if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
    ValidationRule = require('../ValidationRule');
}
extend(ArrayRuleField, BasicRuleField);

function ArrayRuleField(json, validator) {
    var field = this;

    ArrayRuleField.superConstructor.call(this, json, validator);

    field.rules = [];
    field.fields = [];
    field.interval = null;
    field.interval_offsets = [];
}

ArrayRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    field.ui_field = new ArrayField(field.display_name || field.name, field.json);
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
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ArrayRuleField.prototype.new_field = function(index){
    var field = this;

    var rule = field.rule_for_index(index);
    
    return rule.create_ui(field.ui_field);
}

ArrayRuleField.prototype.rule_for_index = function(index){
    var field = this;

    var rule = field.rules[index];
    if(!rule){
        var rule_json = field.rule_json_for_index(index);
        var field_creation = RuleField.create_field(rule_json);
        var err = field_creation[0];
        rule = field_creation[1];
        field.rules[index] = rule;
    }
    return rule;
}

ArrayRuleField.prototype.rule_json_for_index = function(index){
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

ArrayRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}


ArrayRuleField.integer_regex = /^(\d+)$/;
ArrayRuleField.interval_regex = /^(\d+)n(\+(\d+))?$/;
ArrayRuleField.prototype.init = function() {
    var field = this;

    field.indices = {};

    var indices_json = field.validator.get("indices", BasicVal.object(false));
    if (indices_json != null) {
        var indices_validator = new FieldVal(null);

        for(var index_string in indices_json){
        	var field_json = indices_json[index_string];

            //RuleField is created to validate properties, not to use
        	var field_creation = RuleField.create_field(field_json);
            var err = field_creation[0];

            if(err!=null){
                indices_validator.invalid(index_string,err);
                continue;
            }

            var interval_match = index_string.match(ArrayRuleField.interval_regex);
            if(interval_match){
                //Matched
                var interval = interval_match[1];
                var offset = interval_match[3] || 0;
                if(field.interval && interval!==field.interval){
                    indices_validator.invalid(
                        index_string,
                        FieldVal.create_error(
                            ValidationRule.errors.interval_conflict,
                            {},
                            interval,
                            field.interval
                        )
                    );
                    continue;   
                }
                field.interval = interval;
                field.interval_offsets[offset] = field_json;
            } else {
                var integer_match = index_string.match(ArrayRuleField.integer_regex);
                if(integer_match){
                    var integer_index = integer_match[1];
                    field.indices[integer_index] = field_json;
                } else if(index_string==='*'){
                    field.indices['*'] = field_json;
                } else {
                    indices_validator.invalid(
                        index_string,
                        FieldVal.create_error(
                            ValidationRule.errors.invalid_indices_format,
                            {}
                        )
                    );
                }
            }
        }

        var indices_error = indices_validator.end();
        if(indices_error){
            field.validator.invalid("indices", indices_error)
        }
    }

    return field.validator.end();
}

ArrayRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(BasicVal.array(field.required));

    field.checks.push(function(value,emit){

        var array_validator = new FieldVal(value);

        for(var i = 0; i < value.length; i++){
            var rule = field.rule_for_index(i);

            rule.validate_as_field(i, array_validator);
        }

        var array_error = array_validator.end();

        return array_error;
    });
}

if (typeof module != 'undefined') {
    module.exports = ArrayRuleField;
}