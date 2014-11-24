if((typeof require) === 'function'){
    FieldVal = require('fieldval')
    BasicVal = require('fieldval-basicval')
    FVRuleField = require('./fields/FVRuleField');
}

function FVRule() {
    var vr = this;
}

FVRule.errors = {
    interval_conflict: function(this_interval, existing_interval) {
        return {
            error: 501,
            error_message: "Only one interval can be used.",
            interval: this_interval,
            existing: existing_interval
        }
    },
    invalid_indices_format: function(){
        return {
            error: 502,
            error_message: "Invalid format for an indices rule."
        }    
    }
}

FVRule.FVRuleField = FVRuleField;

//Performs validation required for saving
FVRule.prototype.init = function(json, options) {
    var vr = this;

    var field_res = FVRuleField.create_field(json, options);

    //There was an error creating the field
    if(field_res[0]){
        return field_res[0];
    }

    //Keep the created field
    vr.field = field_res[1];
    return null;
}

FVRule.prototype.create_form = function(){
    var vr = this;

    if(FVForm){
        var form = new FVForm();
        vr.field.create_ui(form,form);
        return form;
    }
}

FVRule.prototype.validate = function(value) {
    var vr = this;

    var error = vr.field.validate(value);

    return error;
}

if (typeof module != 'undefined') {
    module.exports = FVRule;
}

FVRuleField.add_field_type({
    name: 'text',
    display_name: 'Text',
    class: (typeof FVTextRuleField) !== 'undefined' ? FVTextRuleField : require('./fields/FVTextRuleField')
});
FVRuleField.add_field_type({
    name: 'string',
    display_name: 'String',
    class: (typeof FVTextRuleField) !== 'undefined' ? FVTextRuleField : require('./fields/FVTextRuleField')
});
FVRuleField.add_field_type({
    name: 'boolean',
    display_name: 'Boolean',
    class: (typeof FVBooleanRuleField) !== 'undefined' ? FVBooleanRuleField : require('./fields/FVBooleanRuleField')
});
FVRuleField.add_field_type({
    name: 'number',
    display_name: 'Number',
    class: (typeof FVNumberRuleField) !== 'undefined' ? FVNumberRuleField : require('./fields/FVNumberRuleField')
});
FVRuleField.add_field_type({
    name: 'object',
    display_name: 'Object',
    class: (typeof FVObjectRuleField) !== 'undefined' ? FVObjectRuleField : require('./fields/FVObjectRuleField')
});
FVRuleField.add_field_type({
    name: 'array',
    display_name: 'Array',
    class: (typeof FVArrayRuleField) !== 'undefined' ? FVArrayRuleField : require('./fields/FVArrayRuleField')
});
FVRuleField.add_field_type({
    name: 'choice',
    display_name: 'Choice',
    class: (typeof FVChoiceRuleField) !== 'undefined' ? FVChoiceRuleField : require('./fields/FVChoiceRuleField')
});
FVRuleField.add_field_type({
    name: 'email',
    display_name: 'Email',
    class: (typeof FVEmailRuleField) !== 'undefined' ? FVEmailRuleField : require('./fields/FVEmailRuleField')
});