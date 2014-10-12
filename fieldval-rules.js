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

function RuleField(json, validator) {
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

RuleField.types = {};

RuleField.add_field_type = function(field_type_data){
    RuleField.types[field_type_data.name] = {
        display_name: field_type_data.display_name,
        class: field_type_data.class
    }
}

RuleField.create_field = function(json, options) {
    var field = null;

    var error = BasicVal.object(true).check(json); 
    if(error){
        return [error, null];
    }

    var validator = new FieldVal(json);

    if(options && options.need_name!==undefined && options.need_name===true){
        var name_checks = [BasicVal.string(true)]
        if(options.existing_names){
            name_checks.push(BasicVal.not_one_of(options.existing_names, {
                error: {
                    "error": 1000,
                    "error_message": "Name already used"
                }
            }));
        }
        validator.get("name", name_checks);
    } 

    var type = validator.get("type", BasicVal.string(true), BasicVal.one_of(RuleField.types));

    if(type){
        var field_type_data = RuleField.types[type];
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

RuleField.prototype.validate_as_field = function(name, validator){
    var field = this;
    
    var value = validator.get(name, field.checks);

    return value;
}

RuleField.prototype.validate = function(value){
    var field = this;

    var validator = new FieldVal(null);

    var error = FieldVal.use_checks(value, field.checks);
    if(error){
        validator.error(error);
    }

    return validator.end();
}

RuleField.prototype.make_nested = function(){}
RuleField.prototype.init = function(){}
RuleField.prototype.remove = function(){}
RuleField.prototype.view_mode = function(){}
RuleField.prototype.edit_mode = function(){}
RuleField.prototype.change_name = function(name) {}
RuleField.prototype.disable = function() {}
RuleField.prototype.enable = function() {}
RuleField.prototype.focus = function() {}
RuleField.prototype.blur = function() {}
RuleField.prototype.val = function(set_val) {}

if (typeof module != 'undefined') {
    module.exports = RuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
}
extend(BasicRuleField, RuleField);

function BasicRuleField(json, validator) {
    var field = this;

    BasicRuleField.superConstructor.call(this, json, validator);
}

BasicRuleField.prototype.init = function(){
    var field = this;
    return field.ui_field.init.apply(field.ui_field, arguments);    
}
BasicRuleField.prototype.remove = function(){
    var field = this;
    return field.ui_field.remove.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.in_array = function(){
    var field = this;
    return field.ui_field.in_array.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.view_mode = function(){
    var field = this;
    return field.ui_field.view_mode.apply(field.ui_field, arguments);    
}
BasicRuleField.prototype.edit_mode = function(){
    var field = this;
    return field.ui_field.edit_mode.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.change_name = function(name) {
    var field = this;
    return field.ui_field.change_name.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.disable = function() {
    var field = this;
    return field.ui_field.disable.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

if (typeof module != 'undefined') {
    module.exports = BasicRuleField;
}

if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(TextRuleField, BasicRuleField);

function TextRuleField(json, validator) {
    var field = this;

    TextRuleField.superConstructor.call(this, json, validator);
}

TextRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new TextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

TextRuleField.prototype.init = function() {
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

    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    field.query = field.validator.get("query", BasicVal.string(false));
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = TextRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(NumberRuleField, BasicRuleField);

function NumberRuleField(json, validator) {
    var field = this;

    NumberRuleField.superConstructor.call(this, json, validator);
}

NumberRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new TextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

NumberRuleField.prototype.init = function() {
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
    module.exports = NumberRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(ObjectRuleField, BasicRuleField);

function ObjectRuleField(json, validator) {
    var field = this;

    ObjectRuleField.superConstructor.call(this, json, validator);
}

ObjectRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    if(field.json.any){
        field.ui_field = new TextField(field.display_name || field.name, {type: 'textarea'});//Empty options

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
            field.ui_field = new ObjectField(field.display_name || field.name, field.json);
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

ObjectRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.object(field.required));

    field.fields = {};

    var fields_json = field.validator.get("fields", BasicVal.array(false));
    if (fields_json != null) {
        var fields_validator = new FieldVal(null);

        //TODO prevent duplicate name keys

        for (var i = 0; i < fields_json.length; i++) {
            var field_json = fields_json[i];

            var field_creation = RuleField.create_field(
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
    module.exports = ObjectRuleField;
}
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
    field.element = field.ui_field.element;
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

ArrayRuleField.integer_regex = /^(\d+)$/;
ArrayRuleField.interval_regex = /^(\d+)n(\+(\d+))?$/;
ArrayRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.array(field.required));

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
    module.exports = ArrayRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(ChoiceRuleField, BasicRuleField);

function ChoiceRuleField(json, validator) {
    var field = this;

    ChoiceRuleField.superConstructor.call(this, json, validator);
}

ChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.json.choices = field.choices;

    field.ui_field = new ChoiceField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ChoiceRuleField.prototype.init = function() {
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
    module.exports = ChoiceRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(BooleanRuleField, BasicRuleField);

function BooleanRuleField(json, validator) {
    var field = this;

    BooleanRuleField.superConstructor.call(this, json, validator);
}

BooleanRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new BooleanField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

BooleanRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.boolean(field.required));

    field.equal_to = field.validator.get("equal_to", BasicVal.boolean(false));
    if(field.equal_to !== undefined){
        field.checks.push(BasicVal.equal_to(field.equal_to));
    }
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = BooleanRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(EmailRuleField, BasicRuleField);

function EmailRuleField(json, validator) {
    var field = this;

    EmailRuleField.superConstructor.call(this, json, validator);
}

EmailRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new TextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

EmailRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.string(field.required), BasicVal.email());
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = EmailRuleField;
}

if((typeof require) === 'function'){
    FieldVal = require('fieldval')
    BasicVal = require('fieldval-basicval')
    RuleField = require('./fields/RuleField');
}

function ValidationRule() {
    var vr = this;
}

ValidationRule.errors = {
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

ValidationRule.RuleField = RuleField;

//Performs validation required for saving
ValidationRule.prototype.init = function(json, options) {
    var vr = this;

    var field_res = RuleField.create_field(json, options);

    //There was an error creating the field
    if(field_res[0]){
        return field_res[0];
    }

    //Keep the created field
    vr.field = field_res[1];
    return null;
}

ValidationRule.prototype.create_form = function(){
    var vr = this;

    if(FVForm){
        var form = new FVForm();
        vr.field.create_ui(form,form);
        return form;
    }
}

ValidationRule.prototype.validate = function(value) {
    var vr = this;

    var error = vr.field.validate(value);

    return error;
}

if (typeof module != 'undefined') {
    module.exports = ValidationRule;
}

RuleField.add_field_type({
    name: 'text',
    display_name: 'Text',
    class: (typeof TextRuleField) !== 'undefined' ? TextRuleField : require('./fields/TextRuleField')
});
RuleField.add_field_type({
    name: 'string',
    display_name: 'String',
    class: (typeof TextRuleField) !== 'undefined' ? TextRuleField : require('./fields/TextRuleField')
});
RuleField.add_field_type({
    name: 'boolean',
    display_name: 'Boolean',
    class: (typeof BooleanRuleField) !== 'undefined' ? BooleanRuleField : require('./fields/BooleanRuleField')
});
RuleField.add_field_type({
    name: 'number',
    display_name: 'Number',
    class: (typeof NumberRuleField) !== 'undefined' ? NumberRuleField : require('./fields/NumberRuleField')
});
RuleField.add_field_type({
    name: 'object',
    display_name: 'Object',
    class: (typeof ObjectRuleField) !== 'undefined' ? ObjectRuleField : require('./fields/ObjectRuleField')
});
RuleField.add_field_type({
    name: 'array',
    display_name: 'Array',
    class: (typeof ArrayRuleField) !== 'undefined' ? ArrayRuleField : require('./fields/ArrayRuleField')
});
RuleField.add_field_type({
    name: 'choice',
    display_name: 'Choice',
    class: (typeof ChoiceRuleField) !== 'undefined' ? ChoiceRuleField : require('./fields/ChoiceRuleField')
});
RuleField.add_field_type({
    name: 'email',
    display_name: 'Email',
    class: (typeof EmailRuleField) !== 'undefined' ? EmailRuleField : require('./fields/EmailRuleField')
});