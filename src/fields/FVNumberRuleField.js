var FVNumberRuleField = (function(){

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

    var _fv_rules_extend;
    if(this.fv_rules_extend !== undefined){
        _fv_rules_extend = this.fv_rules_extend;
    } else if((typeof require) === 'function'){
        _fv_rules_extend = require('../fv_rules_extend');
    } else {
        throw new Error("fv_rules_extend() is missing");
    }
    var fv_rules_extend = _fv_rules_extend;

    fv_rules_extend(FVNumberRuleField, FVRuleField);

    function FVNumberRuleField(json, validator) {
        var field = this;

        FVNumberRuleField.superConstructor.call(this, json, validator);
    }

    FVNumberRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            type: "number",
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVNumberRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.number(field.required));

        field.minimum = field.validator.get("minimum", BasicVal.number(false));
        if (field.minimum != null) {
            field.checks.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
        }

        field.maximum = field.validator.get("maximum", BasicVal.number(false));
        if (field.maximum != null) {
            field.checks.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
        }

        field.integer = field.validator.get("integer", BasicVal.boolean(false));
        if (field.integer) {
            field.checks.push(BasicVal.integer(false,{stop_on_error:false}));
        }

        return field.validator.end();
    }

    FVNumberRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("minimum", new FVTextField("Minimum", {type: "number"}));
        editor.add_field("maximum", new FVTextField("Maximum", {type: "number"}));
        editor.add_field("integer", new FVBooleanField("Integer"));

        var value = editor.val();
        editor.fields.minimum.val(value.minimum);
        editor.fields.maximum.val(value.maximum);
        editor.fields.integer.val(value.integer);
    }

    return FVNumberRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVNumberRuleField;
}