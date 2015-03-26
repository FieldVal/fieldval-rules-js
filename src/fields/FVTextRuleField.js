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

    var _FVRuleField;
    if(this.FVRuleField !== undefined){
        _FVRuleField = this.FVRuleField;
    } else if((typeof require) === 'function'){
        _FVRuleField = require('./FVRuleField');    
    } else {
        throw new Error("FVRuleField is missing");
    }
    var FVRuleField = _FVRuleField;

    var _fieldval_rules_extend;
    if(this.fieldval_rules_extend !== undefined){
        _fieldval_rules_extend = this.fieldval_rules_extend;
    } else if((typeof require) === 'function'){
        _fieldval_rules_extend = require('../fieldval_rules_extend');
    } else {
        throw new Error("fieldval_rules_extend() is missing");
    }
    var fieldval_rules_extend = _fieldval_rules_extend;

    fieldval_rules_extend(FVTextRuleField, FVRuleField);

    function FVTextRuleField(json, validator) {
        var field = this;

        FVTextRuleField.superConstructor.call(this, json, validator);
    }

    FVTextRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            type: field.ui_type,
            use_form: use_form
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVTextRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.string(field.required));

        field.min_length = field.validator.get("min_length", BasicVal.integer(false), BasicVal.minimum(0));
        if(field.min_length !== undefined){
            field.checks.push(BasicVal.min_length(field.min_length,{stop_on_error:false}));
        }

        field.max_length = field.validator.get("max_length", BasicVal.integer(false), BasicVal.minimum(0), function(value){
            if(field.min_length!==undefined && value<field.min_length){
                return FVRuleField.errors.max_length_not_greater_than_min_length();
            }
        });
        if(field.max_length !== undefined){
            field.checks.push(BasicVal.max_length(field.max_length,{stop_on_error:false}));
        }

        field.ui_type = field.validator.get("ui_type", BasicVal.string(false), BasicVal.one_of([
            "text",
            "textarea",
            "password"
        ]));
        
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
    }

    return FVTextRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVTextRuleField;
}