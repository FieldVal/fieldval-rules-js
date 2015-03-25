var FVKeyValueRuleField = (function(){

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

    fieldval_rules_extend(FVKeyValueRuleField, FVRuleField);

    function FVKeyValueRuleField(json, validator) {
        var field = this;

        FVKeyValueRuleField.superConstructor.call(this, json, validator);
    }

    FVKeyValueRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.ui_field = new FVKeyValueField(field.display_name || field.name, {"use_form": use_form});

        field.element = field.ui_field.element;

        field.ui_field.new_field = function(index){
            return field.new_field(index);
        }
        var original_remove_field = field.ui_field.remove_field;
        field.ui_field.remove_field = function(inner_field){
            for(var i = 0; i < field.fields.length; i++){
                if(field.fields[i]===inner_field){
                    field.fields.splice(i,1);
                }
            }
            return original_remove_field.call(field.ui_field, inner_field);
        }
         
        return field.ui_field;
    }

    FVKeyValueRuleField.add_editor_params = function(editor) {
        var fields_field = new FVArrayField("Fields");

        editor.add_field("value_field", new editor.constructor("Value Field", editor));
    }

    FVKeyValueRuleField.prototype.new_field = function(index){
        var field = this;

        var field_creation = FVRuleField.create_field(field.value_rule.json);
        var err = field_creation[0];
        var rule = field_creation[1];
        
        return rule.create_ui();
    }

    FVKeyValueRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.object(field.required));

        field.fields = {};

        field.validator.get("value_field",
            BasicVal.object(true),
            function(val){

                var field_creation = FVRuleField.create_field(val);
                var err = field_creation[0];
                field.value_rule = field_creation[1];
                if(err){
                    return err;
                }
                field.checks.push(function(value){

                    var inner_validator = new FieldVal(value);

                    for(var i in value){
                        if(value.hasOwnProperty(i)){
                            field.value_rule.validate_as_field(i, inner_validator);
                        }
                    }

                    return inner_validator.end();
                })
            }
        )

        return field.validator.end();
    }

    return FVKeyValueRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVKeyValueRuleField;
}