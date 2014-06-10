@import("fieldval_rules_extend.js");
@import("fields/RuleField.js");

function ValidationRule() {
    var vr = this;
}

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

    if(Form){
        var form = new Form();
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