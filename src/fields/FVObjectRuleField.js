if((typeof require) === 'function'){
    extend = require('extend')
    FVBasicRuleField = require('./FVBasicRuleField');
    FVRule = require('../FVRule');
}
extend(FVObjectRuleField, FVBasicRuleField);

function FVObjectRuleField(json, validator) {
    var field = this;

    FVObjectRuleField.superConstructor.call(this, json, validator);
}

FVObjectRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    if(field.any){
        if(field.field_type){
            field.ui_field = new FVKeyValueField(field.display_name || field.name, field.json);

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
        } else {
            field.ui_field = new FVTextField(field.display_name || field.name, {type: 'textarea'});//Empty options

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
        }
    } else {

        if(form){
            field.ui_field = form;
        } else {
            field.ui_field = new FVObjectField(field.display_name || field.name, field.json);
        }

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.create_ui(field.ui_field);
        }

        field.element = field.ui_field.element;
    }

    if(!form){
        parent.add_field(field.name, field.ui_field);
    }

    return field.ui_field;
}

FVObjectRuleField.prototype.new_field = function(index){
    var field = this;

    var field_creation = FVRuleField.create_field(field.field_type.json);
    var err = field_creation[0];
    var rule = field_creation[1];
    
    return rule.create_ui(field.ui_field);
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
        }
    }

    field.any = field.validator.get("any", BasicVal.boolean(false));
    if(!field.any){
        field.checks.push(function(value,emit){

            var inner_validator = new FieldVal(value);

            for(var i in field.fields){
                var inner_field = field.fields[i];
                inner_field.validate_as_field(i, inner_validator);
            }

            var inner_error = inner_validator.end();

            return inner_error;
        });
    }    

    field.validator.get("field_type", BasicVal.object(false), {
        check: function(val){
            if(!field.any){
                return FVRule.errors.field_type_without_any();
            }
        },
        stop_on_error: true
    }, function(val, emit){
        var field_creation = FVRuleField.create_field(val);
        var err = field_creation[0];
        field.field_type = field_creation[1];
        if(err){
            return err;
        }
        field.checks.push(function(value,emit){

            var inner_validator = new FieldVal(value);

            for(var i in value){
                if(value.hasOwnProperty(i)){
                    field.field_type.validate_as_field(i, inner_validator);
                }
            }

            var inner_error = inner_validator.end();

            return inner_error;
        });
    });

    return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = FVObjectRuleField;
}