var FVTextRuleField = (function(){

    var _FieldVal;
    if(this.FieldVal !== undefined){
        _FieldVal = this.FieldVal;
    } else if((typeof require) === 'function'){
        _FieldVal = require('fieldval');
    } else {
        throw new Error("FieldVal Rules requires FieldVal");
    }
    var FieldVal = _FieldVal;
    var BasicVal = FieldVal.BasicVal;

    var _FVBasicRuleField;
    if(this.FVRuleField !== undefined){
        _FVBasicRuleField = this.FVBasicRuleField;
    } else if((typeof require) === 'function'){
        _FVBasicRuleField = require('./FVBasicRuleField');    
    } else {
        throw new Error("FVBasicRuleField is missing");
    }
    var FVBasicRuleField = _FVBasicRuleField;

    var _FVRuleField;
    if(this.FVRuleField !== undefined){
        _FVRuleField = this.FVRuleField;
    } else if((typeof require) === 'function'){
        _FVRuleField = require('./FVRuleField');    
    } else {
        throw new Error("FVRuleField is missing");
    }
    var FVRuleField = _FVRuleField;

    var _extend;
    if(this.extend !== undefined){
        _extend = this.extend;
    } else if((typeof require) === 'function'){
        _extend = require('extend');
    } else {
        throw new Error("extend() is missing");
    }
    var extend = _extend;

    extend(FVTextRuleField, FVBasicRuleField);

    function FVTextRuleField(json, validator) {
        var field = this;

        FVTextRuleField.superConstructor.call(this, json, validator);
    }

    FVTextRuleField.prototype.create_ui = function(parent){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.json.name,
            display_name: field.json.display_name,
            type: field.json.ui_type
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVTextRuleField.prototype.init = function() {
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

        field.ui_type = field.validator.get("ui_type", BasicVal.string(false), BasicVal.one_of([
            "text",
            "textarea",
            "password"
        ]));

        //Currently unused
        field.phrase = field.validator.get("phrase", BasicVal.string(false));
        field.equal_to = field.validator.get("equal_to", BasicVal.string(false));
        field.ci_equal_to = field.validator.get("ci_equal_to", BasicVal.string(false));
        field.prefix = field.validator.get("prefix", BasicVal.string(false));
        field.ci_prefix = field.validator.get("ci_prefix", BasicVal.string(false));
        field.query = field.validator.get("query", BasicVal.string(false));
        
        return field.validator.end();
    }

    FVTextRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("min_length", new FVTextField("Minimum Length", {type: "number"}));
        editor.add_field("max_length", new FVTextField("Maximum Length", {type: "number"}));

        var ui_type = new FVChoiceField("UI Type", {
            choices: ["text", "textarea", "password"]
        })
        editor.add_field("ui_type", ui_type);

        var value = editor.val();
        editor.fields.min_length.val(value.min_length);
        editor.fields.max_length.val(value.max_length);
        editor.fields.ui_type.val(value.ui_type);
    }

    return FVTextRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVTextRuleField;
}