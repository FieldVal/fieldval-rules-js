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