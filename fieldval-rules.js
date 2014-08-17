//Used to subclass Javascript classes
function extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	sub.prototype = new emptyclass();
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
    field.required = field.validator.default(true).get("required", BasicVal.boolean(false))

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

RuleField.create_field = function(json) {
    var field = null;

    var error = BasicVal.object(true).check(json); 
    if(error){
        return [error, null];
    }

    var validator = new FieldVal(json);

    var type = validator.get("type", BasicVal.string(true), BasicVal.one_of(RuleField.types));

    if(type){
        var field_type_data = RuleField.types[type];
        var field_class = field_type_data.class;
        field = new field_class(json, validator)
    } else {
        //Create a generic field to create the correct errors for the "RuleField" fields
        return [validator.end(), null];
    }

    var init_res = field.init();
    if (init_res != null) {
        return [init_res, null];
    }

    field.create_checks();

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
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

TextRuleField.prototype.init = function() {
    var field = this;

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    field.max_length = field.validator.get("max_length", BasicVal.integer(false));

    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    field.query = field.validator.get("query", BasicVal.string(false));
    
    return field.validator.end();
}

TextRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(BasicVal.string(field.required));

    if(field.min_length){
        field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }
    if(field.max_length){
        field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }
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
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

NumberRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
NumberRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
NumberRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
NumberRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

NumberRuleField.prototype.init = function() {
    var field = this;

    field.minimum = field.validator.get("minimum", BasicVal.number(false));
    if (field.minimum != null) {

    }

    field.maximum = field.validator.get("maximum", BasicVal.number(false));
    if (field.maximum != null) {

    }

    field.integer = field.validator.get("integer", BasicVal.boolean(false));

    return field.validator.end();
}

NumberRuleField.prototype.create_checks = function(){
    var field = this;
    
    field.checks.push(BasicVal.number(field.required));

    if(field.minimum){
        field.checks.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
    }
    if(field.maximum){
        field.checks.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
    }
    if(field.integer){
        field.checks.push(BasicVal.integer(false,{stop_on_error:false}));
    }
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
        field.container = field.ui_field.container;
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

        field.container = field.ui_field.container;
    }

    if(!form){
        parent.add_field(field.name, field.ui_field);
    }

    return field.ui_field;
}

ObjectRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
ObjectRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
ObjectRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
ObjectRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}


ObjectRuleField.prototype.init = function() {
    var field = this;

    field.fields = {};

    field.any = field.validator.get("any", BasicVal.boolean(false));

    var fields_json = field.validator.get("fields", BasicVal.array(false));
    if (fields_json != null) {
        var fields_validator = new FieldVal(null);

        //TODO prevent duplicate name keys

        for (var i = 0; i < fields_json.length; i++) {
            var field_json = fields_json[i];

            var field_creation = RuleField.create_field(field_json);
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
            field.validator.invalid("indices",fields_error);
        }
    }

    return field.validator.end();
}

ObjectRuleField.prototype.create_checks = function(validator){
    var field = this;

    field.checks.push(BasicVal.object(field.required));

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
}

if (typeof module != 'undefined') {
    module.exports = ObjectRuleField;
}
if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(ArrayRuleField, BasicRuleField);

function ArrayRuleField(json, validator) {
    var field = this;

    ArrayRuleField.superConstructor.call(this, json, validator);

    field.rules = [];
    field.fields = [];
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

    var rule = field.rules[index];
    if(!rule){
        var rule_json = field.rule_for_index(index);
        var field_creation = RuleField.create_field(rule_json);
        var err = field_creation[0];
        rule = field_creation[1];
        field.rules[index] = rule;
    }
    return rule.create_ui(field.ui_field);
}

ArrayRuleField.prototype.rule_for_index = function(index){
    var field = this;

    var rule_json = field.indices[index];
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


ArrayRuleField.prototype.init = function() {
    var field = this;

    field.indices = {};

    var indices_json = field.validator.get("indices", BasicVal.object(false));
    if (indices_json != null) {
        var indices_validator = new FieldVal(null);

        for(var i in indices_json){
        	var field_json = indices_json[i];

            //RuleField is created to validate properties, not to use
        	var field_creation = RuleField.create_field(field_json);
            var err = field_creation[0];

            console.log(err);
            if(err!=null){
                indices_validator.invalid(i,err);
                continue;
            }

            field.indices[i] = field_json;
        }

        var indices_error = indices_validator.end();
        if(indices_error){
            field.validator.invalid("indices", indices_error)
        }
    }

    return field.validator.end();
}

ArrayRuleField.prototype.create_checks = function(validator){
    var field = this;

    field.checks.push(BasicVal.array(field.required));

    field.checks.push(function(value,emit){

        var array_validator = new FieldVal(value);

        for(var i = 0; i < value.length; i++){
            var rule = field.rules[i];

            rule.validate_as_field(i, array_validator);
        }

        var array_error = array_validator.end();

        return array_error;
    });
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

    field.ui_field = new ChoiceField(field.display_name || field.name, field.choices, field.json);
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ChoiceRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

ChoiceRuleField.prototype.init = function() {
    var field = this;

    field.choices = field.validator.get("choices", BasicVal.array(true));

    return field.validator.end();
}

ChoiceRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(FieldVal.required(true))
    if(field.choices){
        field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
    }
}

if (typeof module != 'undefined') {
    module.exports = ChoiceRuleField;
}

if((typeof require) === 'function'){
    FieldVal = require('fieldval')
    BasicVal = require('fieldval-basicval')
    RuleField = require('./fields/RuleField');
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

function ValidationRule() {
    var vr = this;
}

ValidationRule.RuleField = RuleField;

//Performs validation required for saving
ValidationRule.prototype.init = function(json) {
    var vr = this;

    var field_res = RuleField.create_field(json);

    //There was an error creating the field
    if(field_res[0]){
        return field_res[0];
    }

    //Keep the created field
    vr.field = field_res[1];
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