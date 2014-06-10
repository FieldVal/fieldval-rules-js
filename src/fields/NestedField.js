var logger = require('tracer').console();
var Field = require('./Field');
var FieldVal = require('fieldval');
var bval = require('fieldval-basicval');

require('../extend')(NestedField, Field);

function NestedField(json, validator) {
    var field = this;

    NestedField.superConstructor.call(this, json, validator);
}

NestedField.prototype.init = function() {
    var field = this;

    field.fields = {};

    var fields_json = field.validator.get("fields", bval.object(false));
    if (fields_json != null) {
        var fields_validator = new Validator(null);

        //TODO prevent duplicate name keys

        for (var name in fields_json) {
            var field_json = fields_json[name];

            var field_creation = Field.create_field(field_json);
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

NestedField.prototype.create_operators = function(validator){
    var field = this;

    field.operators.push(bval.object(field.required));

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

module.exports = NestedField;