var FVBooleanRuleField = (function(){

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

    fv_rules_extend(FVBooleanRuleField, FVRuleField);

    function FVBooleanRuleField(json, validator) {
        var field = this;

        FVBooleanRuleField.superConstructor.call(this, json, validator);
    }

    FVBooleanRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVBooleanField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVBooleanRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.boolean(field.required));

        field.equal_to = field.validator.get("equal_to", BasicVal.boolean(false));
        if(field.equal_to !== undefined){
            field.checks.push(BasicVal.equal_to(field.equal_to));
        }
        
        return field.validator.end();
    }

    FVBooleanRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("equal_to", new FVChoiceField("Equal to", {choices: [true, false]} ));
        
        var value = editor.val();
        editor.fields.equal_to.val(value.equal_to);
    }

    return FVBooleanRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVBooleanRuleField;
}