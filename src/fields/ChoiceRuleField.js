fieldval_rules_extend(ChoiceRuleField, RuleField);

function ChoiceRuleField(json, validator) {
    var field = this;

    ChoiceRuleField.superConstructor.call(this, json, validator);
}

ChoiceRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(ChoiceField){
        parent.add_field(field.name, new ChoiceField(field.display_name || field.name, field.choices, field.json));
    }
}

ChoiceRuleField.prototype.init = function() {
    var field = this;

    field.choices = field.validator.get("choices", BasicVal.array(true));

    return field.validator.end();
}

ChoiceRuleField.prototype.create_operators = function(){
    var field = this;

    field.operators.push(Validator.required(true))
    if(field.choices){
        field.operators.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
    }
}