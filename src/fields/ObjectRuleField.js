fieldval_rules_extend(ObjectRuleField, RuleField);

function ObjectRuleField(json, validator) {
    var field = this;

    ObjectRuleField.superConstructor.call(this, json, validator);
}

ObjectRuleField.prototype.create_ui = function(parent,form){
    var field = this;

    if(ObjectField){
        var object_field;
        if(form){
            object_field = form;
        } else {
            object_field = new ObjectField(field.display_name || field.name, field.json);
        }

        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.create_ui(object_field);
        }

        if(!form){
            parent.add_field(field.name, object_field);
        }

        return object_field;
    }
}

ObjectRuleField.prototype.init = function() {
    var field = this;

    field.fields = {};

    var fields_json = field.validator.get("fields", BasicVal.object(false));
    if (fields_json != null) {
        var fields_validator = new FieldVal(null);

        //TODO prevent duplicate name keys

        for (var name in fields_json) {
            var field_json = fields_json[name];

            if(!field_json.name){
                field_json.name = name;
            }

            var field_creation = RuleField.create_field(field_json);
            var err = field_creation[0];
            var nested_field = field_creation[1];

            if(err!=null){
                fields_validator.invalid(name,err);
            }

            field.fields[name] = nested_field;
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