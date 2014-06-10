var logger = require('tracer').console();
var Field = require('./Field');
var FieldVal = require('fieldval');
var bval = require('fieldval-basicval');

require('../extend')(ChoiceField, Field);

function ChoiceField(json, validator) {
    var field = this;

    ChoiceField.superConstructor.call(this, json, validator);
}

ChoiceField.prototype.init = function() {
    var field = this;

    field.choices = field.validator.get("choices", bval.array(true));

    return field.validator.end();
}

ChoiceField.prototype.create_operators = function(){
    var field = this;

    field.operators.push(FieldVal.required(true))
    if(field.choices){
        field.operators.push(bval.one_of(field.choices,{stop_on_error:false}));
    }
}

module.exports = ChoiceField;