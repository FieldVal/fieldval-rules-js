if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(TextRuleField, BasicRuleField);

function TextRuleField(json, validator) {
    var field = this;

    TextRuleField.superConstructor.call(this, json, validator);
}

TextRuleField.prototype.create_ui = function(parent){
    var field = this;

    var type = field.json.type;
    if(field.json.textarea===true){
        type = "textarea";
    }

    field.ui_field = new TextField(field.display_name || field.name, {
        name: field.json.name,
        display_name: field.json.display_name,
        type: type
    });
    field.element = field.ui_field.element;
    parent.add_field(field.name, field);
    return field.ui_field;
}

TextRuleField.prototype.init = function() {
    var field = this;

    field.checks.push(BasicVal.string(field.required));

    field.min_length = field.validator.get("min_length", BasicVal.integer(false));
    if(field.min_length !== undefined){
        field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
    }

    field.max_length = field.validator.get("max_length", BasicVal.integer(false));
    if(field.max_length !== undefined){
        field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
    }

    field.textarea = field.validator.get("textarea", BasicVal.boolean(false));

    //Currently unused
    field.phrase = field.validator.get("phrase", BasicVal.string(false));
    field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
    field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
    field.prefix = field.validator.get("prefix", BasicVal.string(false));
    field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
    field.query = field.validator.get("query", BasicVal.string(false));
    
    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = TextRuleField;
}