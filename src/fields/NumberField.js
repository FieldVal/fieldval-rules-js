var logger = require('tracer').console();
var Field = require('./Field');
var FieldVal = require('fieldval');
var bval = require('fieldval-basicval');

require('../extend')(NumberField, Field);

function NumberField(json, validator) {
    var field = this;

    NumberField.superConstructor.call(this, json, validator);
}

NumberField.prototype.init = function() {
    var field = this;

    field.minimum = field.validator.get("minimum", bval.number(false));
    if (field.minimum != null) {

    }

    field.maximum = field.validator.get("maximum", bval.number(false));
    if (field.maximum != null) {

    }

    field.integer = field.validator.get("integer", bval.boolean(false));

    return field.validator.end();
}

NumberField.prototype.create_operators = function(){
    var field = this;
    
    field.operators.push(bval.number(field.required));

    if(field.minimum){
        field.operators.push(bval.minimum(field.minimum,{stop_on_error:false}));
    }
    if(field.maximum){
        field.operators.push(bval.maximum(field.maximum,{stop_on_error:false}));
    }
    if(field.integer){
        field.operators.push(bval.integer(false,{stop_on_error:false}));
    }
}

module.exports = NumberField;