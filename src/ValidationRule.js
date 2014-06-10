var logger = require('tracer').console();
var Field = require('./Fields/Field');

function ValidationRule() {
    var vr = this;
}

//Performs validation required for saving
ValidationRule.prototype.init = function(json) {
    var vr = this;

    var field_res = Field.create_field(json);

    //There was an error creating the field
    if(field_res[0]){
        return field_res[0];
    }

    //Keep the created field
    vr.field = field_res[1];
}

ValidationRule.prototype.validate = function(value) {
    var vr = this;

    var error = vr.field.validate(value);

    return error;
}

module.exports = ValidationRule;