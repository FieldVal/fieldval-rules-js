if((typeof require) === 'function'){
    FieldVal = require('fieldval')
    BasicVal = require('fieldval-basicval')
    RuleField = require('./fields/RuleField');
}

RuleField.add_field_type({
    name: 'text',
    display_name: 'Text',
    class: (typeof TextRuleField) !== 'undefined' ? TextRuleField : require('./fields/TextRuleField')
});
RuleField.add_field_type({
    name: 'number',
    display_name: 'Number',
    class: (typeof NumberRuleField) !== 'undefined' ? NumberRuleField : require('./fields/NumberRuleField')
});
RuleField.add_field_type({
    name: 'object',
    display_name: 'Object',
    class: (typeof ObjectRuleField) !== 'undefined' ? ObjectRuleField : require('./fields/ObjectRuleField')
});
RuleField.add_field_type({
    name: 'choice',
    display_name: 'Choice',
    class: (typeof ChoiceRuleField) !== 'undefined' ? ChoiceRuleField : require('./fields/ChoiceRuleField')
});

function ValidationRule() {
    var vr = this;
}

ValidationRule.RuleField = RuleField;

//Performs validation required for saving
ValidationRule.prototype.init = function(json) {
    var vr = this;

    var field_res = RuleField.create_field(json);

    //There was an error creating the field
    if(field_res[0]){
        return field_res[0];
    }

    //Keep the created field
    vr.field = field_res[1];
}

ValidationRule.prototype.create_form = function(){
    var vr = this;

    if(FVForm){
        var form = new FVForm();
        vr.field.create_ui(form,form);
        return form;
    }
}

ValidationRule.prototype.validate = function(value) {
    var vr = this;

    var error = vr.field.validate(value);

    return error;
}

if (typeof module != 'undefined') {
    module.exports = ValidationRule;
}