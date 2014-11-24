//Used to subclass Javascript classes
function extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	var empty_instance = new emptyclass();
	for(var i in empty_instance){
		sub.prototype[i] = empty_instance[i];
	}
	sub.prototype.constructor = sub;
	sub.superConstructor = sup;
	sub.superClass = sup.prototype;
}

if (typeof module != 'undefined') {
    module.exports = extend;
}

function FVRuleField(json, validator) {
    var field = this;

    field.json = json;
    field.checks = [];
    field.validator = (typeof validator != 'undefined') ? validator : new FieldVal(json);

    field.name = field.validator.get("name", BasicVal.string(false));
    field.display_name = field.validator.get("display_name", BasicVal.string(false));
    field.description = field.validator.get("description", BasicVal.string(false));
    field.type = field.validator.get("type", BasicVal.string(true));
    field.required = field.validator.default_value(true).get("required", BasicVal.boolean(false))

    if (json != null) {
        var exists = field.validator.get("exists", BasicVal.boolean(false));
        if (exists != null) {
            existsFilter = exists ? 1 : 2;
        }
    }
}

FVRuleField.types = {};

FVRuleField.add_field_type = function(field_type_data){
    FVRuleField.types[field_type_data.name] = {
        display_name: field_type_data.display_name,
        class: field_type_data.class
    }
}

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
    
    var value = validator.get(name, field.checks);

    return value;
}

FVRuleField.prototype.validate = function(value){
    var field = this;

    var validator = new FieldVal(null);

    var error = FieldVal.use_checks(value, field.checks);
    if(error){
        validator.error(error);
    }

    return validator.end();
}

FVRuleField.prototype.make_nested = function(){}
FVRuleField.prototype.init = function(){}
FVRuleField.prototype.remove = function(){}
FVRuleField.prototype.view_mode = function(){}
FVRuleField.prototype.edit_mode = function(){}
FVRuleField.prototype.change_name = function(name) {}
FVRuleField.prototype.disable = function() {}
FVRuleField.prototype.enable = function() {}
FVRuleField.prototype.focus = function() {}
FVRuleField.prototype.blur = function() {}
FVRuleField.prototype.val = function(set_val) {}

if (typeof module != 'undefined') {
    module.exports = FVRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
}
extend(FVBasicRuleField, FVRuleField);

function FVBasicRuleField(json, validator) {
    var field = this;

    FVBasicRuleField.superConstructor.call(this, json, validator);
}

FVBasicRuleField.prototype.init = function(){
    var field = this;
    return field.ui_field.init.apply(field.ui_field, arguments);    
}
FVBasicRuleField.prototype.remove = function(){
    var field = this;
    return field.ui_field.remove.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.in_array = function(){
    var field = this;
    return field.ui_field.in_array.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.change_name = function(name) {
    var field = this;
    return field.ui_field.change_name.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.disable = function() {
    var field = this;
    return field.ui_field.disable.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.enable = function() {
    var field = this;
    return field.ui_field.enable.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

if (typeof module != 'undefined') {
    module.exports = FVBasicRuleField;
}

if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVTextRuleField, FVBasicRuleField);

function FVTextRuleField(json, validator) {
    var field = this;

    FVTextRuleField.superConstructor.call(this, json, validator);
}

FVTextRuleField.prototype.create_ui = function(parent){
    var field = this;

    var type = field.json.type;
    if(field.json.textarea===true){
        type = "textarea";
    }

    field.ui_field = new FVTextField(field.display_name || field.name, {
        name: field.json.name,
        display_name: field.json.display_name,
        type: type
    });
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

FVTextRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.string(field.required));

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    if(field.min_length !== undefined){
        field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }

    field.max_length = field.validator.get("max_length", BasicVal.integer(false));
    if(field.max_length !== undefined){
        field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }

    field.textarea = field.validator.get("textarea", BasicVal.boolean(false));

    //Currently unused
    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    field.query = field.validator.get("query", BasicVal.string(false));
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVTextRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVNumberRuleField, FVBasicRuleField);

function FVNumberRuleField(json, validator) {
    var field = this;

    FVNumberRuleField.superConstructor.call(this, json, validator);
}

FVNumberRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVTextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
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

if (typeof module != 'undefined') {
    module.exports = FVNumberRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVObjectRuleField, FVBasicRuleField);

function FVObjectRuleField(json, validator) {
    var field = this;

    FVObjectRuleField.superConstructor.call(this, json, validator);
}

FVObjectRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    if(field.json.any){
        field.ui_field = new FVTextField(field.display_name || field.name, {type: 'textarea'});//Empty options

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

        if(form){
            field.ui_field = form;
        } else {
            field.ui_field = new FVObjectField(field.display_name || field.name, field.json);
        }

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.create_ui(field.ui_field);
        }

        field.element = field.ui_field.element;
    }

    if(!form){
        parent.add_field(field.name, field.ui_field);
    }

    return field.ui_field;
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
        }
    }

    field.any = field.validator.get("any", BasicVal.boolean(false));
    if(!field.any){
        field.checks.push(function(value,emit){

            var inner_validator = new FieldVal(value);

            for(var i in field.fields){
                var inner_field = field.fields[i];
                inner_field.validate_as_field(i, inner_validator);
            }

            var inner_error = inner_validator.end();

            return inner_error;
        });
    }    

    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVObjectRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
    FVRule = require('../FVRule');
}
extend(FVArrayRuleField, FVBasicRuleField);

function FVArrayRuleField(json, validator) {
    var field = this;

    FVArrayRuleField.superConstructor.call(this, json, validator);

    field.rules = [];
    field.fields = [];
    field.interval = null;
    field.interval_offsets = [];
}

FVArrayRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    field.ui_field = new FVArrayField(field.display_name || field.name, field.json);
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
    parent.add_field(field.name, field);
    return field.ui_field;
}

FVArrayRuleField.prototype.new_field = function(index){
    var field = this;

    var rule = field.rule_for_index(index);
    
    return rule.create_ui(field.ui_field);
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

    field.indices = {};

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
                        FieldVal.create_error(
                            FVRule.errors.interval_conflict,
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
                var integer_match = index_string.match(FVArrayRuleField.integer_regex);
                if(integer_match){
                    var integer_index = integer_match[1];
                    field.indices[integer_index] = field_json;
                } else if(index_string==='*'){
                    field.indices['*'] = field_json;
                } else {
                    indices_validator.invalid(
                        index_string,
                        FieldVal.create_error(
                            FVRule.errors.invalid_indices_format,
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

if (typeof module != 'undefined') {
    module.exports = FVArrayRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVChoiceRuleField, FVBasicRuleField);

function FVChoiceRuleField(json, validator) {
    var field = this;

    FVChoiceRuleField.superConstructor.call(this, json, validator);
}

FVChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.json.choices = field.choices;

    field.ui_field = new FVChoiceField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
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

if (typeof module != 'undefined') {
    module.exports = FVChoiceRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVBooleanRuleField, FVBasicRuleField);

function FVBooleanRuleField(json, validator) {
    var field = this;

    FVBooleanRuleField.superConstructor.call(this, json, validator);
}

FVBooleanRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVBooleanField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
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

if (typeof module != 'undefined') {
    module.exports = FVBooleanRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVEmailRuleField, FVBasicRuleField);

function FVEmailRuleField(json, validator) {
    var field = this;

    FVEmailRuleField.superConstructor.call(this, json, validator);
}

FVEmailRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVTextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

FVEmailRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.string(field.required), BasicVal.email());
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVEmailRuleField;
}

if((typeof require) === 'function'){
    FieldVal = require('fieldval')
    BasicVal = require('fieldval-basicval')
    FVRuleField = require('./fields/FVRuleField');
}

function FVRule() {
    var vr = this;
}

FVRule.errors = {
    interval_conflict: function(this_interval, existing_interval) {
        return {
            error: 501,
            error_message: "Only one interval can be used.",
            interval: this_interval,
            existing: existing_interval
        }
    },
    invalid_indices_format: function(){
        return {
            error: 502,
            error_message: "Invalid format for an indices rule."
        }    
    }
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

FVRule.prototype.create_form = function(){
    var vr = this;

    if(FVForm){
        var form = new FVForm();
        vr.field.create_ui(form,form);
        return form;
    }
}

FVRule.prototype.validate = function(value) {
    var vr = this;

    var error = vr.field.validate(value);

    return error;
}

if (typeof module != 'undefined') {
    module.exports = FVRule;
}

FVRuleField.add_field_type({
    name: 'text',
    display_name: 'Text',
    class: (typeof FVTextRuleField) !== 'undefined' ? FVTextRuleField : require('./fields/FVTextRuleField')
});
FVRuleField.add_field_type({
    name: 'string',
    display_name: 'String',
    class: (typeof FVTextRuleField) !== 'undefined' ? FVTextRuleField : require('./fields/FVTextRuleField')
});
FVRuleField.add_field_type({
    name: 'boolean',
    display_name: 'Boolean',
    class: (typeof FVBooleanRuleField) !== 'undefined' ? FVBooleanRuleField : require('./fields/FVBooleanRuleField')
});
FVRuleField.add_field_type({
    name: 'number',
    display_name: 'Number',
    class: (typeof FVNumberRuleField) !== 'undefined' ? FVNumberRuleField : require('./fields/FVNumberRuleField')
});
FVRuleField.add_field_type({
    name: 'object',
    display_name: 'Object',
    class: (typeof FVObjectRuleField) !== 'undefined' ? FVObjectRuleField : require('./fields/FVObjectRuleField')
});
FVRuleField.add_field_type({
    name: 'array',
    display_name: 'Array',
    class: (typeof FVArrayRuleField) !== 'undefined' ? FVArrayRuleField : require('./fields/FVArrayRuleField')
});
FVRuleField.add_field_type({
    name: 'choice',
    display_name: 'Choice',
    class: (typeof FVChoiceRuleField) !== 'undefined' ? FVChoiceRuleField : require('./fields/FVChoiceRuleField')
});
FVRuleField.add_field_type({
    name: 'email',
    display_name: 'Email',
    class: (typeof FVEmailRuleField) !== 'undefined' ? FVEmailRuleField : require('./fields/FVEmailRuleField')
});