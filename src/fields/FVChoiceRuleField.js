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

    fv_rules_extend(FVChoiceRuleField, FVRuleField);

    function FVChoiceRuleField(json, validator) {
        var field = this;

        FVChoiceRuleField.superConstructor.call(this, json, validator);
    }

    FVChoiceRuleField.prototype.create_ui = function(use_form){
        var field = this;

        field.json.choices = field.choices;

        field.ui_field = new FVChoiceField(field.display_name || field.name, {
            name: field.name,
            display_name: field.display_name,
            choices: field.choices,
            allow_empty: field.allow_empty,
            empty_text: field.empty_text,
            use_form: use_form
        });
        field.element = field.ui_field.element;
        return field.ui_field;
    }

    FVChoiceRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.required(field.required));
        
        field.allow_empty = !field.required;
        field.empty_text = field.validator.get("empty_text", BasicVal.string(false));
        field.choices = field.validator.get("choices", BasicVal.array(true));

        if(field.choices!==undefined){
            field.checks.push(BasicVal.one_of(field.choices,{stop_on_error:false}));
        }

        return field.validator.end();
    }

    FVChoiceRuleField.add_editor_params = function(editor) {
        var field = this;

        var value = editor.val();

        var choices_field = new FVObjectField("Choices");

        var id = 0;

        var create_choices_editor_array  =function () {
            id+=1;
            var choices = new FVArrayField();
            choices.id = id;
            choices.new_field = function() {
                var choices = this;
                if (mode_field.val() == "simple") { 
                    return new FVTextField("Value");
                } else {
                    var tuple = new FVArrayField("", {
                        hide_remove_button: true, 
                        hide_add_button: true,
                        sortable: false
                    })
                    tuple.add_field(new FVTextField("Value"));
                    tuple.add_field(new FVTextField("Display name"));
                    return tuple;
                }
            }
            choices.val = function(set_val, options) {
                var choices = this;
                if (set_val) {
                    var transformed_choices = [];
                    for (var i=0; i<set_val.length; i++) {
                        var old_choice = set_val[i];
                        if (mode_field.val() == "simple") {
                            if (Array.isArray(old_choice)) {
                                transformed_choices.push(old_choice[0])
                            } else {
                                transformed_choices.push(old_choice);
                            }
                        } else {
                            if (Array.isArray(old_choice)) {
                                transformed_choices.push(old_choice)
                            } else {
                                transformed_choices.push([old_choice, old_choice]);
                            }
                        }
                    }
                    return FVArrayField.prototype.val.call(choices, transformed_choices, options);

                } else {
                    var original_choices = FVArrayField.prototype.val.apply(choices, arguments);
                    var transformed_choices = [];
                    for (var i=0; i<original_choices.length; i++) {
                        var choice = original_choices[i];
                        if (Array.isArray(choice) && choice[0] == choice[1]) {
                            transformed_choices.push(choice[0])
                        } else {
                            transformed_choices.push(choice);
                        }
                    }
                    return transformed_choices;
                }

            }
            return choices;
        }

        
        var mode_field = new FVChoiceField("Mode", {choices: ["simple", "advanced"]}).on_change(function(val) {
            var old_choices = [];
            if (choices_field.fields.choices) {
                old_choices = choices_field.fields.choices.val();
            }
            choices_field.remove_field("choices");
            
            var choices = create_choices_editor_array();
            choices_field.add_field("choices", choices);
            choices.val(old_choices);
        })

        choices_field.add_field("mode", mode_field);

        choices_field.update_mode = function(choices) {
            var is_simple = true;
            if (choices) {
                for (var i=0; i<choices.length; i++) {
                    if (Array.isArray(choices[i])) {
                        is_simple = false;
                        break;
                    }
                }
            }

            if (is_simple) {
                mode_field.val("simple");
            } else {
                mode_field.val("advanced");
            }
        }

        choices_field.val = function() {
            if (arguments.length >0 && arguments[0]) {
                choices_field.update_mode(arguments[0]);
            }

            var choices = choices_field.fields.choices;
            return choices.val.apply(choices, arguments);
        }

        choices_field.update_mode(value.choices);
        choices_field.val(value.choices);

        editor.add_field("choices", choices_field);

        editor.add_field("empty_text", new FVTextField("Empty Text"));

        editor.fields.allow_empty.val(value.allow_empty);
        editor.fields.empty_message.val(value.empty_message);

    }

    return FVChoiceRuleField;

}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVChoiceRuleField;
}
