function FVRuleField(json, validator) {
    var field = this;

    field.json = json;
    field.checks = [];
    field.validator = (typeof validator != 'undefined') ? validator : new FieldVal(json);

    field.name = field.validator.get("name", BasicVal.string(false));
    field.display_name = field.validator.get("display_name", BasicVal.string(false));
    field.description = field.validator.get("description", BasicVal.string(false));
    field.type = field.validator.get("type", BasicVal.string(true));
    field.required = field.validator.default_value(true).get("required", BasicVal.boolean(false))

    if (json != null) {
        var exists = field.validator.get("exists", BasicVal.boolean(false));
        if (exists != null) {
            existsFilter = exists ? 1 : 2;
        }
    }
}

FVRuleField.types = {};

FVRuleField.add_field_type = function(field_type_data){
    FVRuleField.types[field_type_data.name] = {
        display_name: field_type_data.display_name,
        class: field_type_data.class
    }
}

FVRuleField.create_field = function(json, options) {
    var field = null;

    var error = BasicVal.object(true).check(json); 
    if(error){
        return [error, null];
    }

    var validator = new FieldVal(json);
    var name_checks = [BasicVal.string(false)];

    if(options){
        if(options.need_name!==undefined && options.need_name===true){
            name_checks.push(BasicVal.string(true));
        }
        if(options.allow_dots!==undefined && options.allow_dots===false){
            name_checks.push(BasicVal.does_not_contain(["."]));
        }

        if(options.existing_names){
            name_checks.push(BasicVal.not_one_of(options.existing_names, {
                error: {
                    "error": 1000,
                    "error_message": "Name already used"
                }
            }));
        }
    }

    validator.get("name", name_checks);

    var type = validator.get("type", BasicVal.string(true), BasicVal.one_of(FVRuleField.types));

    if(type){
        var field_type_data = FVRuleField.types[type];
        var field_class = field_type_data.class;
        field = new field_class(json, validator)
    } else {
        return [validator.end(), null];
    }

    var init_res = field.init();
    if (init_res != null) {
        return [init_res, null];
    }

    return [null, field];
}

FVRuleField.prototype.validate_as_field = function(name, validator){
    var field = this;
    
    validator.get_async(name, field.checks);
}

FVRuleField.prototype.validate = function(value, callback){
    var field = this;

    if(!callback){
        throw new Error("No callback specified");
    }

    return FieldVal.use_checks(value, field.checks, {}, function(error){
        callback(error);
    });
}

FVRuleField.prototype.make_nested = function(){}
FVRuleField.prototype.init = function(){}
FVRuleField.prototype.remove = function(){}
FVRuleField.prototype.view_mode = function(){}
FVRuleField.prototype.edit_mode = function(){}
FVRuleField.prototype.change_name = function(name) {}
FVRuleField.prototype.disable = function() {}
FVRuleField.prototype.enable = function() {}
FVRuleField.prototype.focus = function() {}
FVRuleField.prototype.blur = function() {}
FVRuleField.prototype.val = function(set_val) {}

if (typeof module != 'undefined') {
    module.exports = FVRuleField;
}