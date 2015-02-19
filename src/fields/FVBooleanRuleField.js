if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVBooleanRuleField, FVBasicRuleField);

function FVBooleanRuleField(json, validator) {
    var field = this;

    FVBooleanRuleField.superConstructor.call(this, json, validator);
}

FVBooleanRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVBooleanField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    return field.ui_field;
}

FVBooleanRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.boolean(field.required));

    field.equal_to = field.validator.get("equal_to", BasicVal.boolean(false));
    if(field.equal_to !== undefined){
        field.checks.push(BasicVal.equal_to(field.equal_to));
    }
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVBooleanRuleField;
}