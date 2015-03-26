//Used to subclass Javascript classes
function fieldval_rules_extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	sub.prototype = new emptyclass();
	sub.prototype.constructor = sub;
	sub.superConstructor = sup;
	sub.superClass = sup.prototype;
}

if (typeof module != "undefined") {
    module.exports = fieldval_rules_extend;
}

var FVRuleField = (function(){

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

    function FVRuleField(json, validator) {
        var field = this;

        field.json = json;
        field.checks = [];
        field.validator = (typeof validator != 'undefined') ? validator : new FieldVal(json);

        field.name = field.validator.get("name", BasicVal.string(false));
        field.display_name = field.validator.get("display_name", BasicVal.string(false));
        field.description = field.validator.get("description", BasicVal.string(false));
        field.type = field.validator.get("type", BasicVal.string(true));
        field.required = field.validator.get("required", BasicVal.boolean(false));
        if(field.required===undefined){
            field.required = true;//Default to true
        }

        if (json != null) {
            var exists = field.validator.get("exists", BasicVal.boolean(false));
            if (exists != null) {
                existsFilter = exists ? 1 : 2;
            }
        }
    }

    FVRuleField.errors = {
        interval_conflict: function(this_interval, existing_interval) {
            return {
                error: 501,
                error_message: "Only one interval can be used.",
                interval: this_interval,
                existing: existing_interval
            }
        },
        index_already_present: function(){
            return {
                error: 502,
                error_message: "Index already present."
            }    
        },
        invalid_indices_format: function(){
            return {
                error: 503,
                error_message: "Invalid format for an indices rule."
            }    
        },
        incomplete_indicies: function(missing){
            var error = {
                error: 504,
                error_message: "Incomplete indices pattern"
            }
            if(missing!==undefined){
                error.missing = missing;
            }
            return error;
        },
        any_and_fields: function(){
            return {
                error: 505,
                error_message: "'any' can't be used with 'fields'."
            }    
        },
        key_value_field_without_any: function(){
            return {
                error: 506,
                error_message: "'key_value_field' can't be used without setting any to true."
            }    
        },
        max_length_not_greater_than_min_length: function(){
            return {
                error: 507,
                error_message: "Must be greater than or equal to the minimum length"
            }    
        },
        maximum_not_greater_than_minimum: function(){
            return {
                error: 508,
                error_message: "Must be greater than or equal to the minimum"
            }    
        }
    }

    FVRuleField.types = {};

    FVRuleField.add_rule_type = function(field_type_data){
        FVRuleField.types[field_type_data.name] = {
            display_name: field_type_data.display_name,
            class: field_type_data.class
        }
    }

    //add_field_type is deprecated
    FVRuleField.add_field_type = FVRuleField.add_rule_type;

    FVRuleField.create_field = function(json, options) {
        var field = null;

        var error = BasicVal.object(true).check(json); 
        if(error){
            return [error, null];
        }

        var validator = new FieldVal(json);
        var name_checks = [BasicVal.string(false)];

        if(options){
            if(options.need_name!==undefined && options.need_name===true){
                name_checks.push(BasicVal.string(true));
            }
            if(options.allow_dots!==undefined && options.allow_dots===false){
                name_checks.push(BasicVal.does_not_contain(["."]));
            }

            if(options.existing_names){
                name_checks.push(BasicVal.not_one_of(options.existing_names, {
                    error: {
                        "error": 1000,
                        "error_message": "Name already used"
                    }
                }));
            }
        }

        validator.get("name", name_checks);

        var type = validator.get("type", BasicVal.string(true), BasicVal.one_of(FVRuleField.types));

        if(type){
            var field_type_data = FVRuleField.types[type];
            var field_class = field_type_data.class;
            field = new field_class(json, validator)
        } else {
            return [validator.end(), null];
        }

        var init_res = field.init();
        if (init_res != null) {
            return [init_res, null];
        }

        return [null, field];
    }

    FVRuleField.prototype.validate_as_field = function(name, validator){
        var field = this;
        
        validator.get_async(name, field.checks);
    }

    FVRuleField.prototype.validate = function(value, callback){
        var field = this;

        if(!callback){
            throw new Error("No callback specified");
        }

        return FieldVal.use_checks(value, field.checks, {}, function(error){
            callback(error);
        });
    }

    FVRuleField.prototype.init = function(){
        if(this.constructor.name){
            throw new Error(".init not overriden for class: "+this.constructor.name);
        } else {
            throw new Error(".init not overriden for class: "+this.constructor);
        }
    }

    return FVRuleField;

}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVRuleField;
}

var FVTextRuleField = (function(){

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

    fieldval_rules_extend(FVTextRuleField, FVRuleField);

    function FVTextRuleField(json, validator) {
        var field = this;

        FVTextRuleField.superConstructor.call(this, json, validator);
    }

    FVTextRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            type: field.ui_type,
            use_form: use_form
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVTextRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.string(field.required));

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

        field.ui_type = field.validator.get("ui_type", BasicVal.string(false), BasicVal.one_of([
            "text",
            "textarea",
            "password"
        ]));
        
        return field.validator.end();
    }

    FVTextRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("min_length", new FVTextField("Minimum Length", {type: "number"}));
        editor.add_field("max_length", new FVTextField("Maximum Length", {type: "number"}));

        var ui_type = new FVChoiceField("UI Type", {
            choices: ["text", "textarea", "password"]
        })
        editor.add_field("ui_type", ui_type);
    }

    return FVTextRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVTextRuleField;
}
var FVNumberRuleField = (function(){

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

    fieldval_rules_extend(FVNumberRuleField, FVRuleField);

    function FVNumberRuleField(json, validator) {
        var field = this;

        FVNumberRuleField.superConstructor.call(this, json, validator);
    }

    FVNumberRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            type: "number",
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVNumberRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.number(field.required));

        field.minimum = field.validator.get("minimum", BasicVal.number(false));
        if (field.minimum != null) {
            field.checks.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
        }

        field.maximum = field.validator.get("maximum", BasicVal.number(false));
        if (field.maximum != null) {
            field.checks.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
        }

        field.integer = field.validator.get("integer", BasicVal.boolean(false));
        if (field.integer) {
            field.checks.push(BasicVal.integer(false,{stop_on_error:false}));
        }

        return field.validator.end();
    }

    FVNumberRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("minimum", new FVTextField("Minimum", {type: "number"}));
        editor.add_field("maximum", new FVTextField("Maximum", {type: "number"}));
        editor.add_field("integer", new FVBooleanField("Integer"));

        var value = editor.val();
        editor.fields.minimum.val(value.minimum);
        editor.fields.maximum.val(value.maximum);
        editor.fields.integer.val(value.integer);
    }

    return FVNumberRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVNumberRuleField;
}
var FVObjectRuleField = (function(){

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

    fieldval_rules_extend(FVObjectRuleField, FVRuleField);

    function FVObjectRuleField(json, validator) {
        var field = this;

        FVObjectRuleField.superConstructor.call(this, json, validator);
    }

    FVObjectRuleField.prototype.create_ui = function(use_form){
        var field = this;

        if(field.any){
            field.ui_field = new FVTextField(field.display_name || field.name, {"type": 'textarea', "use_form": use_form});//Empty options

            field.ui_field.val = function(set_val){//Override the .val function
                var ui_field = this;
                if (arguments.length===0) {
                    var value = ui_field.input.val();
                    if(value.length===0){
                        return null;
                    }
                    try{
                        return JSON.parse(value);
                    } catch (e){
                        console.error("FAILED TO PARSE: ",value);
                    }
                    return value;
                } else {
                    ui_field.input.val(JSON.stringify(set_val,null,4));
                    return ui_field;
                }
            }
            field.element = field.ui_field.element;
        } else {

            field.ui_field = new FVObjectField(field.display_name || field.name, {"use_form": use_form});

            for(var i in field.fields){
                var inner_field = field.fields[i];
                var inner_ui_field = inner_field.create_ui();
                field.ui_field.add_field(inner_field.name, inner_ui_field);
            }

            field.element = field.ui_field.element;
        }

        return field.ui_field;
    }

    FVObjectRuleField.add_editor_params = function(editor) {
        var fields_field = new FVArrayField("Fields");
        fields_field.new_field = function(index){
            var inner_field = new editor.constructor(null, editor);
            fields_field.add_field(null, inner_field);
        }

        var any = new FVBooleanField("Any");
        any.on_change(function(value) {
            if (value) {
                editor.remove_field("fields");
            } else {
                editor.add_field("fields", fields_field);
            }
        })

        editor.add_field("any", any);
        editor.add_field("fields", fields_field);
    }

    FVObjectRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.object(field.required));

        field.fields = {};

        var fields_json = field.validator.get("fields", BasicVal.array(false));
        if (fields_json != null) {
            var fields_validator = new FieldVal(null);

            for (var i = 0; i < fields_json.length; i++) {
                var field_json = fields_json[i];

                var field_creation = FVRuleField.create_field(
                    field_json,
                    {
                        need_name: true,
                        existing_names: field.fields
                    }
                );
                var err = field_creation[0];
                var nested_field = field_creation[1];

                if(err!=null){
                    fields_validator.invalid(i,err);
                    continue;
                }

                field.fields[nested_field.name] = nested_field;
            }

            var fields_error = fields_validator.end();
            if(fields_error!=null){
                field.validator.invalid("fields",fields_error);
            } else {

                field.checks.push(function(value,emit,done){

                    var inner_validator = new FieldVal(value);

                    for(var i in field.fields){
                        var inner_field = field.fields[i];
                        inner_field.validate_as_field(i, inner_validator);
                    }

                    return inner_validator.end(function(error){
                        done(error);
                    });
                });

            }
        }

        field.any = field.validator.get("any", 
            BasicVal.boolean(false),
            function(val){
                if(val){
                    if(fields_json!==undefined){
                        return FVRuleField.errors.any_and_fields();
                    }
                }
            }
        );

        if(!field.any){
            if(fields_json===undefined){
                //No fields should be allowed in the object (empty object only)

                field.checks.push(function(value,emit,done){
                    var inner_validator = new FieldVal(value);
                    return inner_validator.end(function(error){
                        done(error);
                    });
                });
            }
        }

        return field.validator.end();
    }

    return FVObjectRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVObjectRuleField;
}
var FVKeyValueRuleField = (function(){

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

    fieldval_rules_extend(FVKeyValueRuleField, FVRuleField);

    function FVKeyValueRuleField(json, validator) {
        var field = this;

        FVKeyValueRuleField.superConstructor.call(this, json, validator);
    }

    FVKeyValueRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVKeyValueField(field.display_name || field.name, {"use_form": use_form});

        field.element = field.ui_field.element;

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
         
        return field.ui_field;
    }

    FVKeyValueRuleField.add_editor_params = function(editor) {
        var fields_field = new FVArrayField("Fields");

        editor.add_field("value_field", new editor.constructor("Value Field", editor));
    }

    FVKeyValueRuleField.prototype.new_field = function(index){
        var field = this;

        var field_creation = FVRuleField.create_field(field.value_rule.json);
        var err = field_creation[0];
        var rule = field_creation[1];
        
        return rule.create_ui();
    }

    FVKeyValueRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.object(field.required));

        field.fields = {};

        field.validator.get("value_field",
            BasicVal.object(true),
            function(val){

                var field_creation = FVRuleField.create_field(val);
                var err = field_creation[0];
                field.value_rule = field_creation[1];
                if(err){
                    return err;
                }
                field.checks.push(function(value){

                    var inner_validator = new FieldVal(value);

                    for(var i in value){
                        if(value.hasOwnProperty(i)){
                            field.value_rule.validate_as_field(i, inner_validator);
                        }
                    }

                    return inner_validator.end();
                })
            }
        )

        return field.validator.end();
    }

    return FVKeyValueRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVKeyValueRuleField;
}
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
var FVChoiceRuleField = (function(){

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

    fieldval_rules_extend(FVChoiceRuleField, FVRuleField);

    function FVChoiceRuleField(json, validator) {
        var field = this;

        FVChoiceRuleField.superConstructor.call(this, json, validator);
    }

    FVChoiceRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.json.choices = field.choices;

        field.ui_field = new FVChoiceField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            choices: field.choices,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVChoiceRuleField.prototype.init = function() {
        var field = this;

        field.allow_empty = field.validator.get("allow_empty", BasicVal.boolean(false));
        field.empty_message = field.validator.get("empty_message", BasicVal.string(false));
        field.choices = field.validator.get("choices", BasicVal.array(true));

        if(field.choices!==undefined){
            field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
        }

        return field.validator.end();
    }

    FVChoiceRuleField.add_editor_params = function(editor) {
        var field = this;

        var value = editor.val();

        var choices_field = new FVObjectField("Choices");

        var id = 0;

        var create_choices_editor_array  =function () {
            id+=1;
            var choices = new FVArrayField();
            choices.id = id;
            choices.new_field = function() {
                var choices = this;
                if (mode_field.val() == "simple") { 
                    return new FVTextField("Value");
                } else {
                    var tuple = new FVArrayField("", {
                        hide_remove_button: true, 
                        hide_add_button: true,
                        sortable: false
                    })
                    tuple.add_field(new FVTextField("Value"));
                    tuple.add_field(new FVTextField("Display name"));
                    return tuple;
                }
            }
            choices.val = function(set_val, options) {
                var choices = this;
                if (set_val) {
                    var transformed_choices = [];
                    for (var i=0; i<set_val.length; i++) {
                        var old_choice = set_val[i];
                        if (mode_field.val() == "simple") {
                            if (Array.isArray(old_choice)) {
                                transformed_choices.push(old_choice[0])
                            } else {
                                transformed_choices.push(old_choice);
                            }
                        } else {
                            if (Array.isArray(old_choice)) {
                                transformed_choices.push(old_choice)
                            } else {
                                transformed_choices.push([old_choice, old_choice]);
                            }
                        }
                    }
                    return FVArrayField.prototype.val.call(choices, transformed_choices, options);

                } else {
                    var original_choices = FVArrayField.prototype.val.apply(choices, arguments);
                    var transformed_choices = [];
                    for (var i=0; i<original_choices.length; i++) {
                        var choice = original_choices[i];
                        if (Array.isArray(choice) && choice[0] == choice[1]) {
                            transformed_choices.push(choice[0])
                        } else {
                            transformed_choices.push(choice);
                        }
                    }
                    return transformed_choices;
                }

            }
            return choices;
        }

        
        var mode_field = new FVChoiceField("Mode", {choices: ["simple", "advanced"]}).on_change(function(val) {
            var old_choices = [];
            if (choices_field.fields.choices) {
                old_choices = choices_field.fields.choices.val();
            }
            choices_field.remove_field("choices");
            
            var choices = create_choices_editor_array();
            choices_field.add_field("choices", choices);
            choices.val(old_choices);
        })

        choices_field.add_field("mode", mode_field);

        choices_field.update_mode = function(choices) {
            var is_simple = true;
            if (choices) {
                for (var i=0; i<choices.length; i++) {
                    if (Array.isArray(choices[i])) {
                        is_simple = false;
                        break;
                    }
                }
            }

            if (is_simple) {
                mode_field.val("simple");
            } else {
                mode_field.val("advanced");
            }
        }

        choices_field.val = function() {
            if (arguments.length >0 && arguments[0]) {
                choices_field.update_mode(arguments[0]);
            }

            var choices = choices_field.fields.choices;
            return choices.val.apply(choices, arguments);
        }

        choices_field.update_mode(value.choices);
        choices_field.val(value.choices);

        editor.add_field("choices", choices_field);

        editor.add_field("allow_empty", new FVBooleanField("Allow empty"));
        editor.add_field("empty_message", new FVTextField("Empty message"));

        editor.fields.allow_empty.val(value.allow_empty);
        editor.fields.empty_message.val(value.empty_message);

    }

    return FVChoiceRuleField;

}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVChoiceRuleField;
}
var FVBooleanRuleField = (function(){

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

    fieldval_rules_extend(FVBooleanRuleField, FVRuleField);

    function FVBooleanRuleField(json, validator) {
        var field = this;

        FVBooleanRuleField.superConstructor.call(this, json, validator);
    }

    FVBooleanRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVBooleanField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVBooleanRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.boolean(field.required));

        field.equal_to = field.validator.get("equal_to", BasicVal.boolean(false));
        if(field.equal_to !== undefined){
            field.checks.push(BasicVal.equal_to(field.equal_to));
        }
        
        return field.validator.end();
    }

    FVBooleanRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("equal_to", new FVChoiceField("Equal to", {choices: [true, false]} ));
        
        var value = editor.val();
        editor.fields.equal_to.val(value.equal_to);
    }

    return FVBooleanRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVBooleanRuleField;
}
var FVEmailRuleField = (function(){

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

    fieldval_rules_extend(FVEmailRuleField, FVRuleField);

    function FVEmailRuleField(json, validator) {
        var field = this;

        FVEmailRuleField.superConstructor.call(this, json, validator);
    }

    FVEmailRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVEmailRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.string(field.required), BasicVal.email());
        
        return field.validator.end();
    }

    return FVEmailRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVEmailRuleField;
}
var FVDateRuleField = (function(){

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

    fieldval_rules_extend(FVDateRuleField, FVRuleField);

    function FVDateRuleField(json, validator) {
        var field = this;

        FVDateRuleField.superConstructor.call(this, json, validator);
    }

    FVDateRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVDateField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form,
            format: field.date_format
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVDateRuleField.prototype.init = function() {
        var field = this;

        field.date_format = field.validator.get("format", BasicVal.string(true), BasicVal.date_format({emit:FieldVal.DateVal.EMIT_STRING}));
        if (field.date_format !== undefined) {
            field.checks.push(BasicVal.date(field.date_format));
        }
        return field.validator.end();
    }

    FVDateRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("format", new FVTextField("Date format"));
        
        var value = editor.val();
        editor.fields.format.val(value.format);
    }

    return FVDateRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVDateRuleField;
}

var FVRule = (function(){

    var _FieldVal;
    if(this.FieldVal !== undefined){
        _FieldVal = this.FieldVal;
    } else if((typeof require) === "function"){
        _FieldVal = require("fieldval");
    } else {
        throw new Error("FieldVal Rules requires FieldVal");
    }
    var FieldVal = _FieldVal;
    var BasicVal = FieldVal.BasicVal;

    var _FVRuleField;
    if(this.FVRuleField !== undefined){
        _FVRuleField = this.FVRuleField;
    } else if((typeof require) === "function"){
        _FVRuleField = require("./fields/FVRuleField");    
    } else {
        throw new Error("FVRuleField is missing");
    }
    var FVRuleField = _FVRuleField;

    function FVRule() {
        var vr = this;
    }

    FVRule.FVRuleField = FVRuleField;

    //Performs validation required for saving
    FVRule.prototype.init = function(json, options) {
        var vr = this;

        var field_res = FVRuleField.create_field(json, options);

        //There was an error creating the field
        if(field_res[0]){
            return field_res[0];
        }

        //Keep the created field
        vr.field = field_res[1];
        return null;
    }

    FVRule.add_rule_type = function(){
        var vr = this;

        return FVRule.FVRuleField.add_rule_type.apply(FVRule.FVRuleField, arguments);
    }

    FVRule.prototype.create_form = function(){
        var vr = this;

        return vr.create_ui(true);
    }

    FVRule.prototype.create_ui = function(form){
        var vr = this;

        return vr.field.create_ui(form);
    }

    FVRule.prototype.validate = function() {
        var vr = this;
        return vr.field.validate.apply(vr.field,arguments);
    }

    FVRule.prototype.check = function(val, emit, done) {
        var vr = this;
        
        vr.field.validate(val,function(err){
            done(err);
        });
    }

    FVRule.add_rule_type({
        name: "text",
        display_name: "Text",
        class: (typeof FVTextRuleField) !== "undefined" ? FVTextRuleField : require("./fields/FVTextRuleField")
    });
    FVRule.add_rule_type({
        name: "string",
        display_name: "String",
        class: (typeof FVTextRuleField) !== "undefined" ? FVTextRuleField : require("./fields/FVTextRuleField")
    });
    FVRule.add_rule_type({
        name: "boolean",
        display_name: "Boolean",
        class: (typeof FVBooleanRuleField) !== "undefined" ? FVBooleanRuleField : require("./fields/FVBooleanRuleField")
    });
    FVRule.add_rule_type({
        name: "number",
        display_name: "Number",
        class: (typeof FVNumberRuleField) !== "undefined" ? FVNumberRuleField : require("./fields/FVNumberRuleField")
    });
    FVRule.add_rule_type({
        name: "object",
        display_name: "Object",
        class: (typeof FVObjectRuleField) !== "undefined" ? FVObjectRuleField : require("./fields/FVObjectRuleField")
    });
    FVRule.add_rule_type({
        name: "key_value",
        display_name: "Key Value",
        class: (typeof FVKeyValueRuleField) !== "undefined" ? FVKeyValueRuleField : require("./fields/FVKeyValueRuleField")
    });
    FVRule.add_rule_type({
        name: "array",
        display_name: "Array",
        class: (typeof FVArrayRuleField) !== "undefined" ? FVArrayRuleField : require("./fields/FVArrayRuleField")
    });
    FVRule.add_rule_type({
        name: "choice",
        display_name: "Choice",
        class: (typeof FVChoiceRuleField) !== "undefined" ? FVChoiceRuleField : require("./fields/FVChoiceRuleField")
    });
    FVRule.add_rule_type({
        name: "email",
        display_name: "Email",
        class: (typeof FVEmailRuleField) !== "undefined" ? FVEmailRuleField : require("./fields/FVEmailRuleField")
    });
    FVRule.add_rule_type({
        name: "date",
        display_name: "Date",
        class: (typeof FVDateRuleField) !== "undefined" ? FVDateRuleField : require("./fields/FVDateRuleField")
    });

    return FVRule;

}).call((typeof window !== "undefined")?window:null);

if (typeof module != "undefined") {
    module.exports = FVRule;
}
var FVRuleEditor = (function(){

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
        _fieldval_rules_extend = require('./fieldval_rules_extend');
    } else {
        throw new Error("fieldval_rules_extend() is missing");
    }
    var fieldval_rules_extend = _fieldval_rules_extend;

    fieldval_rules_extend(FVRuleEditor, FVForm);
	function FVRuleEditor(name, options){
		var editor = this;

	    editor.base_fields = {};

		FVRuleEditor.superConstructor.call(this, name, options);

		var field_type_choices = [];
		var types = FVRuleField.types;
		for(var i in types){
			if (types.hasOwnProperty(i)) {
				var field_type_class = types[i];

				var name = i;
				var display_name = field_type_class.display_name;
				if(display_name){
					field_type_choices.push([name, display_name])
				} else {
					field_type_choices.push(name);
				}
			}

		}

		editor.add_field("name", new FVTextField("Name"));
		editor.add_field("display_name", new FVTextField("Display Name"));
		editor.add_field("type", new FVChoiceField("Type", {
			choices: field_type_choices
		}).on_change(function(){
			editor.update_type_fields();
		}));

		for(var name in editor.fields){
			if (editor.fields.hasOwnProperty(name)) {
		    	editor.base_fields[name] = true;
			}
	    }

	    editor.update_type_fields();
	}

	FVRuleEditor.prototype.update_type_fields = function(value){
		var editor = this;

		var type = editor.fields.type.val();
		for(var name in editor.fields){
			if(!editor.base_fields[name]){
				editor.fields[name].remove();
			}
		}

		if (type) {
			var rule_field = FVRuleField.types[type].class;
			if (rule_field.add_editor_params !== undefined) {
				rule_field.add_editor_params(editor, value);
			}
		}
	}

	FVRuleEditor.prototype.val = function(set_val, options) {
		var editor = this;

		if (set_val) {
			editor.fields.type.val(set_val.type, {ignore_change: true});
			editor.update_type_fields(set_val);
			delete set_val.type;
		}
		return FVForm.prototype.val.apply(editor, arguments);
	}

	return FVRuleEditor;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVRuleEditor;
}