if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(BooleanRuleField, BasicRuleField);

function BooleanRuleField(json, validator) {
    var field = this;

    BooleanRuleField.superConstructor.call(this, json, validator);
}

BooleanRuleField.prototype.create_ui = function(parent){
    var field = this;

    field.ui_field = new BooleanField(field.display_name || field.name, field.json);
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

BooleanRuleField.prototype.init = function() {
    var field = this;

    field.equal_to = field.validator.get("equal_to", BasicVal.boolean(false));
    
    return field.validator.end();
}

BooleanRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(BasicVal.boolean(field.required));

    if(field.equal_to){
        field.checks.push(BasicVal.equal_to(field.equal_to));
    }
}

if (typeof module != 'undefined') {
    module.exports = BooleanRuleField;
}