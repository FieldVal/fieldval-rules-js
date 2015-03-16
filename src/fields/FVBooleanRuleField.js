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

    extend(FVBooleanRuleField, FVBasicRuleField);

    function FVBooleanRuleField(json, validator) {
        var field = this;

        FVBooleanRuleField.superConstructor.call(this, json, validator);
    }

    FVBooleanRuleField.prototype.create_ui = function(parent){
        var field = this;

        field.ui_field = new FVBooleanField(field.display_name || field.name, field.json);
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

    FVBooleanRuleField.create_editor_ui = function(value, form) {
        var field = this;

        form.add_field("equal_to", new FVChoiceField("Equal to", {choices: [true, false]} ));
        
        form.fields.equal_to.val(value.equal_to);
    }

    return FVBooleanRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVBooleanRuleField;
}