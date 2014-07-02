fieldval_rules_extend(ChoiceRuleField, RuleField);

function ChoiceRuleField(json, validator) {
    var field = this;

    ChoiceRuleField.superConstructor.call(this, json, validator);
}

ChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(ChoiceField){
        var ui_field = new ChoiceField(field.display_name || field.name, field.choices, field.json);
        parent.add_field(field.name, ui_field);
        return ui_field;
    }
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