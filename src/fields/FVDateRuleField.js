if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVDateRuleField, FVBasicRuleField);

function FVDateRuleField(json, validator) {
    var field = this;

    FVDateRuleField.superConstructor.call(this, json, validator);
}

FVDateRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new FVDateField(field.display_name || field.name, {
        name: field.json.name,
        display_name: field.json.display_name,
        format: field.date_format
    });

    field.element = field.ui_field.element;
    return field.ui_field;
}

FVDateRuleField.prototype.init = function() {
    var field = this;

    field.date_format = field.validator.get("format", BasicVal.string(true), BasicVal.date_format({emit_string:true}));
    if (field.date_format !== undefined) {
        field.checks.push(BasicVal.date(field.date_format));
    }
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVDateRuleField;
}