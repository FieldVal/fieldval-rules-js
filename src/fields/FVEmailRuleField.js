var FVEmailRuleField = (function(){

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

    fv_rules_extend(FVEmailRuleField, FVRuleField);

    function FVEmailRuleField(json, validator) {
        var field = this;

        FVEmailRuleField.superConstructor.call(this, json, validator);
    }

    FVEmailRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVEmailRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.string(field.required), BasicVal.email());
        
        return field.validator.end();
    }

    return FVEmailRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVEmailRuleField;
}