var FVDateRuleField = (function(){

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

    fv_rules_extend(FVDateRuleField, FVRuleField);

    function FVDateRuleField(json, validator) {
        var field = this;

        FVDateRuleField.superConstructor.call(this, json, validator);
    }

    FVDateRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVDateField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form,
            format: field.date_format
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVDateRuleField.prototype.init = function() {
        var field = this;

        field.date_format = field.validator.get("format", BasicVal.string(true), BasicVal.date_format({emit:FieldVal.DateVal.EMIT_STRING}));
        if (field.date_format !== undefined) {
            field.checks.push(BasicVal.date(field.date_format));
        }
        return field.validator.end();
    }

    FVDateRuleField.add_editor_params = function(editor) {
        var field = this;

        editor.add_field("format", new FVTextField("Date format"));
        
        var value = editor.val();
        editor.fields.format.val(value.format);
    }

    return FVDateRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVDateRuleField;
}