if((typeof require) === 'function'){
    extend = require('extend')
}
extend(TextRuleField, RuleField);

function TextRuleField(json, validator) {
    var field = this;

    TextRuleField.superConstructor.call(this, json, validator);
}

TextRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(TextField){
        var ui_field = new TextField(field.display_name || field.name, field.json);
        parent.add_field(field.name, ui_field);
        return ui_field;
    }
}

TextRuleField.prototype.init = function() {
    var field = this;

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    field.max_length = field.validator.get("max_length", BasicVal.integer(false));

    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    field.query = field.validator.get("query", BasicVal.string(false));
    
    return field.validator.end();
}

TextRuleField.prototype.create_checks = function(){
    var field = this;

    field.checks.push(BasicVal.string(field.required));

    if(field.min_length){
        field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }
    if(field.max_length){
        field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }
}

if (typeof module != 'undefined') {
    module.exports = TextRuleField;
}