@import("./TextRuleField.js");
@import("./NumberRuleField.js");
@import("./NestedRuleField.js");
@import("./ChoiceRuleField.js");

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