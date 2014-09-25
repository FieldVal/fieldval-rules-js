if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(ChoiceRuleField, BasicRuleField);

function ChoiceRuleField(json, validator) {
    var field = this;

    ChoiceRuleField.superConstructor.call(this, json, validator);
}

ChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.json.choices = field.choices;

    field.ui_field = new ChoiceField(field.display_name || field.name, field.json);
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ChoiceRuleField.prototype.init = function() {
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
    module.exports = ChoiceRuleField;
}