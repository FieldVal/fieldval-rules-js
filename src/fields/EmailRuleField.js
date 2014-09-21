if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(EmailRuleField, BasicRuleField);

function EmailRuleField(json, validator) {
    var field = this;

    EmailRuleField.superConstructor.call(this, json, validator);
}

EmailRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new TextField(field.display_name || field.name, field.json);
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

EmailRuleField.prototype.init = function() {
    var field = this;
    
    return field.validator.end();
}

EmailRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(BasicVal.string(field.required), BasicVal.email());
}

if (typeof module != 'undefined') {
    module.exports = EmailRuleField;
}