if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVEmailRuleField, FVBasicRuleField);

function FVEmailRuleField(json, validator) {
    var field = this;

    FVEmailRuleField.superConstructor.call(this, json, validator);
}

FVEmailRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVTextField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    return field.ui_field;
}

FVEmailRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.string(field.required), BasicVal.email());
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVEmailRuleField;
}