function fieldval_rules_extend(sub, sup) {
    function emptyclass() {}
    emptyclass.prototype = sup.prototype;
    sub.prototype = new emptyclass();
    sub.prototype.constructor = sub;
    sub.superConstructor = sup;
    sub.superClass = sup.prototype;
}
fieldval_rules_extend(TextRuleField, RuleField);

function TextRuleField(json, validator) {
    var field = this;

    TextRuleField.superConstructor.call(this, json, validator);
}

TextRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(TextField){
        parent.add_field(field.name, new TextField(field.display_name || field.name, field.json));
    }
}

TextRuleField.prototype.init = function() {
    var field = this;

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    if (field.min_length != null) {
        if (field.for_search) {
            fieldErrors.getOrMakeInvalid().put("min_length", new ValidatorError(57).error);
        } else {
            if (field.min_length < 1) {
                fieldErrors.getOrMakeInvalid().put("min_length", new ValidatorError(24).error);
            }
        }
    }

    field.max_length = field.validator.get("max_length", BasicVal.integer(false));
    if (field.max_length != null) {

        if (field.for_search) {
            fieldErrors.getOrMakeInvalid().put("max_length", new ValidatorError(57).error);
        } else {
            if (field.max_length < 1) {
                fieldErrors.getOrMakeInvalid().put("max_length", new ValidatorError(24).error);
            }

        }
    }

    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    if (field.phrase != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("phrase", new ValidatorError(65).error);
        }
    }

    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    if (field.equal_to != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("equal_to", new ValidatorError(65).error);
        }
    }

    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    if (field.ci_equal_to != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("ci_equal_to", new ValidatorError(65).error);
        }
    }

    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    if (field.prefix != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("prefix", new ValidatorError(65).error);
        }
    }

    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    if (field.ci_prefix != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("ci_prefix", new ValidatorError(65).error);
        }
    }

    field.query = field.validator.get("query", BasicVal.string(false));
    if (field.query != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("query", new ValidatorError(65).error);
        }
    }

    return field.validator.end();
}

TextRuleField.prototype.create_operators = function(){
    var field = this;

    field.operators.push(BasicVal.string(field.required));

    if(field.min_length){
        field.operators.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }
    if(field.max_length){
        field.operators.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }
}
fieldval_rules_extend(NumberRuleField, RuleField);

function NumberRuleField(json, validator) {
    var field = this;

    NumberRuleField.superConstructor.call(this, json, validator);
}

NumberRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(TextField){
        parent.add_field(field.name, new TextField(field.display_name || field.name, field.json));
    }
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

NumberRuleField.prototype.create_operators = function(){
    var field = this;
    
    field.operators.push(BasicVal.number(field.required));

    if(field.minimum){
        field.operators.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
    }
    if(field.maximum){
        field.operators.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
    }
    if(field.integer){
        field.operators.push(BasicVal.integer(false,{stop_on_error:false}));
    }
}
fieldval_rules_extend(NestedRuleField, RuleField);

function NestedRuleField(json, validator) {
    var field = this;

    NestedRuleField.superConstructor.call(this, json, validator);
}

NestedRuleField.prototype.create_ui = function(parent,form){
    var field = this;

    if(ObjectField){
        var object_field;
        if(form){
            object_field = form;
        } else {
            object_field = new ObjectField(field.display_name || field.name, field.json);
        }

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.create_ui(object_field);
        }

        if(!form){
            parent.add_field(field.name, object_field);
        }
    }
}

NestedRuleField.prototype.init = function() {
    var field = this;

    field.fields = {};

    var fields_json = field.validator.get("fields", BasicVal.object(false));
    if (fields_json != null) {
        var fields_validator = new Validator(null);

        //TODO prevent duplicate name keys

        for (var name in fields_json) {
            var field_json = fields_json[name];

            if(!field_json.name){
                field_json.name = name;
            }

            var field_creation = RuleField.create_field(field_json);
            var err = field_creation[0];
            var nested_field = field_creation[1];

            if(err!=null){
                fields_validator.invalid(name,err);
            }

            field.fields[name] = nested_field;
        }

        var fields_error = fields_validator.end();
        if(fields_error!=null){
            field.validator.invalid("fields",fields_error);
        }
    }

    return field.validator.end();
}

NestedRuleField.prototype.create_operators = function(validator){
    var field = this;

    field.operators.push(BasicVal.object(field.required));

    field.operators.push(function(value,emit){

        var inner_validator = new Validator(value);

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.validate_as_field(i, inner_validator);
        }

        var inner_error = inner_validator.end();

        return inner_error;
    });
}
fieldval_rules_extend(ChoiceRuleField, RuleField);

function ChoiceRuleField(json, validator) {
    var field = this;

    ChoiceRuleField.superConstructor.call(this, json, validator);
}

ChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(ChoiceField){
        parent.add_field(field.name, new ChoiceField(field.display_name || field.name, field.choices, field.json));
    }
}

ChoiceRuleField.prototype.init = function() {
    var field = this;

    field.choices = field.validator.get("choices", BasicVal.array(true));

    return field.validator.end();
}

ChoiceRuleField.prototype.create_operators = function(){
    var field = this;

    field.operators.push(Validator.required(true))
    if(field.choices){
        field.operators.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
    }
}

function RuleField(json, validator) {
    var field = this;

    field.json = json;
    field.operators = [];
    field.validator = (typeof validator != 'undefined') ? validator : new Validator(json);

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

RuleField.types = {
    text: TextRuleField,
    number: NumberRuleField,
    nested: NestedRuleField,
    choice: ChoiceRuleField
};

RuleField.create_field = function(json) {
    var field = null;

    var validator = new Validator(json);

    var type = validator.get("type", BasicVal.string(true), BasicVal.one_of([
        "nested","text","number","choice"//Need to improve structure
    ]));

    if(type){
        var field_class = RuleField.types[type];
        field = new field_class(json, validator)
    } else {
        //Create a generic field to create the correct errors for the "RuleField" fields
        return [validator.end(), null];
    }

    var init_res = field.init();
    if (init_res != null) {
        return [init_res, null];
    }

    field.create_operators();

    return [null, field];
}

RuleField.prototype.validate_as_field = function(name, validator){
    var field = this;

    var value = validator.get(name, field.operators);

    return value;
}

RuleField.prototype.validate = function(value){
    var field = this;

    var validator = new Validator(null);

    var value = Validator.use_operators(value, field.operators, validator);

    return validator.end();
}

function ValidationRule() {
    var vr = this;
}

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

    if(Form){
        var form = new Form();
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