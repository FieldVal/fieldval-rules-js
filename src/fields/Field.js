var logger = require('tracer').console();

var have_subclasses = false;

var FieldVal = require('fieldval');
var bval = require('fieldval-basicval');

function Field(json, validator) {
    var field = this;

    field.json = json;
    field.operators = [];
    field.validator = (typeof validator != 'undefined') ? validator : new Validator(json);

    field.name = field.validator.get("name", bval.string(false));
    field.display_name = field.validator.get("display_name", bval.string(false));
    field.description = field.validator.get("description", bval.string(false));
    field.type = field.validator.get("type", bval.string(true));
    field.required = field.validator.default(true).get("required", bval.boolean(false))

    if (json != null) {
        var exists = field.validator.get("exists", bval.boolean(false));
        if (exists != null) {
            existsFilter = exists ? 1 : 2;
        }
    }
}
Field.types = {};

Field.get_subclasses = function() {
    Field.types.TextField = require('./TextField');
    Field.types.NumberField = require('./NumberField');
    Field.types.NestedField = require('./NestedField');
    Field.types.ChoiceField = require('./ChoiceField');
}

Field.create_field = function(json) {

    if (!have_subclasses) {
        Field.get_subclasses();
    }

    var field = null;

    var validator = new Validator(json);

    var type = validator.get("type", bval.string(true), bval.one_of([
        "nested","text","number","choice"//Need to improve structure
    ]));

    if(type === "nested"){
        field = new Field.types.NestedField(json, validator);
    } else if (type === "text") {
        field = new Field.types.TextField(json, validator)
    } else if (type === "number") {
        field = new Field.types.NumberField(json, validator)
    } else if (type === "choice") {
        field = new Field.types.ChoiceField(json, validator)
    } else {
        //Create a generic field to create the correct errors for the "Field" fields
        var field = new Field(json, validator);
        field.validator.invalid("type", {
            error: -1,
            error_message: "Field type does not exist"
        });

        return [field.validator.end(), null];
    }

    var init_res = field.init();
    if (init_res != null) {
        return [init_res, null];
    }

    field.create_operators();

    return [null, field];
}

Field.prototype.validate_as_field = function(name, validator){
    var field = this;

    var value = validator.get(name, field.operators);

    return value;
}

Field.prototype.validate = function(value){
    var field = this;

    var validator = new Validator(null);

    var value = Validator.use_operators(value, field.operators, validator);

    return validator.end();
}


module.exports = Field;