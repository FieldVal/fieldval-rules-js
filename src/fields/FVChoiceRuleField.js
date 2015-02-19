if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
}
extend(FVChoiceRuleField, FVBasicRuleField);

function FVChoiceRuleField(json, validator) {
    var field = this;

    FVChoiceRuleField.superConstructor.call(this, json, validator);
}

FVChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.json.choices = field.choices;

    field.ui_field = new FVChoiceField(field.display_name || field.name, field.json);
    field.element = field.ui_field.element;
    return field.ui_field;
}

FVChoiceRuleField.prototype.init = function() {
    var field = this;

    field.allow_empty = field.validator.get("allow_empty", BasicVal.boolean(false));
    field.empty_message = field.validator.get("empty_message", BasicVal.string(false));
    field.choices = field.validator.get("choices", BasicVal.array(true));

    if(field.choices!==undefined){
        field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
    }

    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVChoiceRuleField;
}