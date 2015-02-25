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

    extend(FVNumberRuleField, FVBasicRuleField);

    function FVNumberRuleField(json, validator) {
        var field = this;

        FVNumberRuleField.superConstructor.call(this, json, validator);
    }

    FVNumberRuleField.prototype.create_ui = function(parent){
        var field = this;

        field.ui_field = new FVTextField(field.display_name || field.name, field.json);
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

    return FVNumberRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVNumberRuleField;
}