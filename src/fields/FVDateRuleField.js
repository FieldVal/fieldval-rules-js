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

    extend(FVDateRuleField, FVBasicRuleField);

    function FVDateRuleField(json, validator) {
        var field = this;

        FVDateRuleField.superConstructor.call(this, json, validator);
    }

    FVDateRuleField.prototype.create_ui = function(parent){
        var field = this;

        field.ui_field = new FVDateField(field.display_name || field.name, {
            name: field.json.name,
            display_name: field.json.display_name,
            format: field.date_format
        });

        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVDateRuleField.prototype.init = function() {
        var field = this;

        console.log(FieldVal);
        console.log(FieldVal.DateVal);

        console.log(field.date_format);
        field.date_format = field.validator.get("format", BasicVal.string(true), BasicVal.date_format({emit:FieldVal.DateVal.EMIT_STRING}));
        if (field.date_format !== undefined) {
            field.checks.push(BasicVal.date(field.date_format));
        }
        return field.validator.end();
    }

    FVDateRuleField.create_editor_ui = function(value, form) {
        var field = this;

        form.add_field("format", new FVTextField("Date format"));
        form.fields.format.val(value.format);
    }

    return FVDateRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVDateRuleField;
}