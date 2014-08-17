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

    field.ui_field = new ChoiceField(field.display_name || field.name, field.choices, field.json);
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ChoiceRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
ChoiceRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

ChoiceRuleField.prototype.init = function() {
    var field = this;

    field.choices = field.validator.get("choices", BasicVal.array(true));

    return field.validator.end();
}

ChoiceRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(FieldVal.required(true))
    if(field.choices){
        field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
    }
}

if (typeof module != 'undefined') {
    module.exports = ChoiceRuleField;
}