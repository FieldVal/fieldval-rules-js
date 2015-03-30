var FVObjectRuleField = (function(){

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

    fv_rules_extend(FVObjectRuleField, FVRuleField);

    function FVObjectRuleField(json, validator) {
        var field = this;

        FVObjectRuleField.superConstructor.call(this, json, validator);
    }

    FVObjectRuleField.prototype.create_ui = function(use_form){
        var field = this;

        if(field.any){
            field.ui_field = new FVTextField(field.display_name || field.name, {"type": 'textarea', "use_form": use_form});//Empty options

            field.ui_field.val = function(set_val){//Override the .val function
                var ui_field = this;
                if (arguments.length===0) {
                    var value = ui_field.input.val();
                    if(value.length===0){
                        return null;
                    }
                    try{
                        return JSON.parse(value);
                    } catch (e){
                        console.error("FAILED TO PARSE: ",value);
                    }
                    return value;
                } else {
                    ui_field.input.val(JSON.stringify(set_val,null,4));
                    return ui_field;
                }
            }
            field.element = field.ui_field.element;
        } else {

            field.ui_field = new FVObjectField(field.display_name || field.name, {"use_form": use_form});

            for(var i in field.fields){
                var inner_field = field.fields[i];
                var inner_ui_field = inner_field.create_ui();
                field.ui_field.add_field(inner_field.name, inner_ui_field);
            }

            field.element = field.ui_field.element;
        }

        return field.ui_field;
    }

    FVObjectRuleField.add_editor_params = function(editor) {
        var fields_field = new FVArrayField("Fields");
        fields_field.new_field = function(index){
            var inner_field = new editor.constructor(null, editor);
            fields_field.add_field(null, inner_field);
        }

        var any = new FVBooleanField("Any");
        any.on_change(function(value) {
            if (value) {
                editor.remove_field("fields");
            } else {
                editor.add_field("fields", fields_field);
            }
        })

        editor.add_field("any", any);
        editor.add_field("fields", fields_field);
    }

    FVObjectRuleField.prototype.init = function() {
        var field = this;

        field.checks.push(BasicVal.object(field.required));

        field.fields = {};

        var fields_json = field.validator.get("fields", BasicVal.array(false));
        if (fields_json != null) {
            var fields_validator = new FieldVal(null);

            for (var i = 0; i < fields_json.length; i++) {
                var field_json = fields_json[i];

                var field_creation = FVRuleField.create_field(
                    field_json,
                    {
                        need_name: true,
                        existing_names: field.fields
                    }
                );
                var err = field_creation[0];
                var nested_field = field_creation[1];

                if(err!=null){
                    fields_validator.invalid(i,err);
                    continue;
                }

                field.fields[nested_field.name] = nested_field;
            }

            var fields_error = fields_validator.end();
            if(fields_error!=null){
                field.validator.invalid("fields",fields_error);
            } else {

                field.checks.push(function(value,emit,done){

                    var inner_validator = new FieldVal(value);

                    for(var i in field.fields){
                        var inner_field = field.fields[i];
                        inner_field.validate_as_field(i, inner_validator);
                    }

                    return inner_validator.end(function(error){
                        done(error);
                    });
                });

            }
        }

        field.any = field.validator.get("any", 
            BasicVal.boolean(false),
            function(val){
                if(val){
                    if(fields_json!==undefined){
                        return FVRuleField.errors.any_and_fields();
                    }
                }
            }
        );

        if(!field.any){
            if(fields_json===undefined){
                //No fields should be allowed in the object (empty object only)

                field.checks.push(function(value,emit,done){
                    var inner_validator = new FieldVal(value);
                    return inner_validator.end(function(error){
                        done(error);
                    });
                });
            }
        }

        return field.validator.end();
    }

    return FVObjectRuleField;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVObjectRuleField;
}