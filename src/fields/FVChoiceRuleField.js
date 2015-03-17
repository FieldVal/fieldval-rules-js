var FVChoiceRuleField = (function(){

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

    extend(FVChoiceRuleField, FVBasicRuleField);

    function FVChoiceRuleField(json, validator) {
        var field = this;

        FVChoiceRuleField.superConstructor.call(this, json, validator);
    }

    FVChoiceRuleField.prototype.create_ui = function(parent){
        var field = this;

        field.json.choices = field.choices;

        field.ui_field = new FVChoiceField(field.display_name || field.name, field.json);
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVChoiceRuleField.prototype.init = function() {
        var field = this;

        field.allow_empty = field.validator.get("allow_empty", BasicVal.boolean(false));
        field.empty_message = field.validator.get("empty_message", BasicVal.string(false));
        field.choices = field.validator.get("choices", BasicVal.array(true));

        if(field.choices!==undefined){
            field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
        }

        return field.validator.end();
    }

    FVChoiceRuleField.add_editor_params = function(editor) {
        var field = this;

        var choices_array_field = new FVArrayField("Choices");
        choices_array_field.new_field = function() {
            return new FVTextField();
        }

        editor.add_field("choices", choices_array_field);
        editor.add_field("allow_empty", new FVBooleanField("Allow empty"));
        editor.add_field("empty_message", new FVTextField("Empty message"));

        var value = editor.val();
        editor.fields.choices.val(value.choices);
        editor.fields.allow_empty.val(value.allow_empty);
        editor.fields.empty_message.val(value.empty_message);
    }

    return FVChoiceRuleField;

}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVChoiceRuleField;
}