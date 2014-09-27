function RuleField(json, validator) {
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

RuleField.types = {};

RuleField.add_field_type = function(field_type_data){
    RuleField.types[field_type_data.name] = {
        display_name: field_type_data.display_name,
        class: field_type_data.class
    }
}

RuleField.create_field = function(json, options) {
    var field = null;

    var error = BasicVal.object(true).check(json); 
    if(error){
        return [error, null];
    }

    var validator = new FieldVal(json);

    if(options && options.need_name!==undefined && options.need_name===true){
        var name_checks = [BasicVal.string(true)]
        if(options.existing_names){
            name_checks.push(BasicVal.not_one_of(options.existing_names, {
                error: {
                    "error": 1000,
                    "error_message": "Name already used"
                }
            }));
        }
        validator.get("name", name_checks);
    } 

    var type = validator.get("type", BasicVal.string(true), BasicVal.one_of(RuleField.types));

    if(type){
        var field_type_data = RuleField.types[type];
        var field_class = field_type_data.class;
        field = new field_class(json, validator)
    } else {
        //Create a generic field to create the correct errors for the "RuleField" fields
        return [validator.end(), null];
    }

    var init_res = field.init();
    if (init_res != null) {
        return [init_res, null];
    }

    return [null, field];
}

RuleField.prototype.validate_as_field = function(name, validator){
    var field = this;
    
    var value = validator.get(name, field.checks);

    return value;
}

RuleField.prototype.validate = function(value){
    var field = this;

    var validator = new FieldVal(null);

    var error = FieldVal.use_checks(value, field.checks);
    if(error){
        validator.error(error);
    }

    return validator.end();
}

RuleField.prototype.make_nested = function(){}
RuleField.prototype.init = function(){}
RuleField.prototype.remove = function(){}
RuleField.prototype.view_mode = function(){}
RuleField.prototype.edit_mode = function(){}
RuleField.prototype.change_name = function(name) {}
RuleField.prototype.disable = function() {}
RuleField.prototype.enable = function() {}
RuleField.prototype.focus = function() {}
RuleField.prototype.blur = function() {}
RuleField.prototype.val = function(set_val) {}

if (typeof module != 'undefined') {
    module.exports = RuleField;
}