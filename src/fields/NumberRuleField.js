fieldval_rules_extend(NumberRuleField, RuleField);

function NumberRuleField(json, validator) {
    var field = this;

    NumberRuleField.superConstructor.call(this, json, validator);
}

NumberRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(TextField){
        parent.add_field(field.name, new TextField(field.display_name || field.name, field.json));
    }
}

NumberRuleField.prototype.init = function() {
    var field = this;

    field.minimum = field.validator.get("minimum", BasicVal.number(false));
    if (field.minimum != null) {

    }

    field.maximum = field.validator.get("maximum", BasicVal.number(false));
    if (field.maximum != null) {

    }

    field.integer = field.validator.get("integer", BasicVal.boolean(false));

    return field.validator.end();
}

NumberRuleField.prototype.create_operators = function(){
    var field = this;
    
    field.operators.push(BasicVal.number(field.required));

    if(field.minimum){
        field.operators.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
    }
    if(field.maximum){
        field.operators.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
    }
    if(field.integer){
        field.operators.push(BasicVal.integer(false,{stop_on_error:false}));
    }
}