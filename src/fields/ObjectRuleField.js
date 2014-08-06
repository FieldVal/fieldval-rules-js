if((typeof require) === 'function'){
    extend = require('extend')
}
extend(ObjectRuleField, RuleField);

function ObjectRuleField(json, validator) {
    var field = this;

    ObjectRuleField.superConstructor.call(this, json, validator);
}

ObjectRuleField.prototype.create_ui = function(parent){
    var field = this;

    if(field.json.any){
        var text_field = new TextField(field.display_name || field.name, {type: 'textarea'});//Empty options

        text_field.val = function(set_val){//Override the .val function
            var field = this;
            if (arguments.length===0) {
                var value = field.input.val();
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
                field.input.val(JSON.stringify(set_val,null,4));
                return field;
            }
        }

        parent.add_field(field.name, text_field);

        field.text_field = text_field;

        return text_field;
    } else {
        var object_field = new ObjectField(field.display_name || field.name, field.json);

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.create_ui(object_field);
        }

        parent.add_field(field.name, object_field);

        field.object_field = object_field;

        return object_field;
    }
}

ObjectRuleField.prototype.init = function() {
    var field = this;

    field.fields = {};

    field.any = field.validator.get("any", BasicVal.boolean(false));

    var fields_json = field.validator.get("fields", BasicVal.array(false));
    if (fields_json != null) {
        var fields_validator = new FieldVal(null);

        //TODO prevent duplicate name keys

        for (var i = 0; i < fields_json.length; i++) {
            var field_json = fields_json[i];

            var field_creation = RuleField.create_field(field_json);
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

    return field.validator.end();
}

ObjectRuleField.prototype.create_checks = function(validator){
    var field = this;

    field.checks.push(BasicVal.object(field.required));

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
}

if (typeof module != 'undefined') {
    module.exports = ObjectRuleField;
}