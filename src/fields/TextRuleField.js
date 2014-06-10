fieldval_rules_extend(TextRuleField, RuleField);

function TextRuleField(json, validator) {
    var field = this;

    TextRuleField.superConstructor.call(this, json, validator);
}

TextRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(TextField){
        parent.add_field(field.name, new TextField(field.display_name || field.name, field.json));
    }
}

TextRuleField.prototype.init = function() {
    var field = this;

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    if (field.min_length != null) {
        if (field.for_search) {
            fieldErrors.getOrMakeInvalid().put("min_length", new ValidatorError(57).error);
        } else {
            if (field.min_length < 1) {
                fieldErrors.getOrMakeInvalid().put("min_length", new ValidatorError(24).error);
            }
        }
    }

    field.max_length = field.validator.get("max_length", BasicVal.integer(false));
    if (field.max_length != null) {

        if (field.for_search) {
            fieldErrors.getOrMakeInvalid().put("max_length", new ValidatorError(57).error);
        } else {
            if (field.max_length < 1) {
                fieldErrors.getOrMakeInvalid().put("max_length", new ValidatorError(24).error);
            }

        }
    }

    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    if (field.phrase != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("phrase", new ValidatorError(65).error);
        }
    }

    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    if (field.equal_to != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("equal_to", new ValidatorError(65).error);
        }
    }

    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    if (field.ci_equal_to != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("ci_equal_to", new ValidatorError(65).error);
        }
    }

    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    if (field.prefix != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("prefix", new ValidatorError(65).error);
        }
    }

    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    if (field.ci_prefix != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("ci_prefix", new ValidatorError(65).error);
        }
    }

    field.query = field.validator.get("query", BasicVal.string(false));
    if (field.query != null) {
        if (!for_search) {
            fieldErrors.getOrMakeInvalid().put("query", new ValidatorError(65).error);
        }
    }

    return field.validator.end();
}

TextRuleField.prototype.create_operators = function(){
    var field = this;

    field.operators.push(BasicVal.string(field.required));

    if(field.min_length){
        field.operators.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }
    if(field.max_length){
        field.operators.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }
}