if((typeof require) === 'function'){
    extend = require('extend')
    BasicRuleField = require('./BasicRuleField');
}
extend(ArrayRuleField, BasicRuleField);

function ArrayRuleField(json, validator) {
    var field = this;

    ArrayRuleField.superConstructor.call(this, json, validator);

    field.rules = [];
    field.fields = [];
}

ArrayRuleField.prototype.create_ui = function(parent, form){
    var field = this;

    field.ui_field = new ArrayField(field.display_name || field.name, field.json);
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
    field.container = field.ui_field.container;
    parent.add_field(field.name, field);
    return field.ui_field;
}

ArrayRuleField.prototype.new_field = function(index){
    var field = this;

    var rule = field.rules[index];
    if(!rule){
        var rule_json = field.rule_for_index(index);
        var field_creation = RuleField.create_field(rule_json);
        var err = field_creation[0];
        rule = field_creation[1];
        field.rules[index] = rule;
    }
    return rule.create_ui(field.ui_field);
}

ArrayRuleField.prototype.rule_for_index = function(index){
    var field = this;

    var rule_json = field.indices[index];
    if(!rule_json){
        rule_json = field.indices["*"];
    }

    return rule_json;
}

ArrayRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
ArrayRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}


ArrayRuleField.prototype.init = function() {
    var field = this;

    field.indices = {};

    var indices_json = field.validator.get("indices", BasicVal.object(false));
    if (indices_json != null) {
        var indices_validator = new FieldVal(null);

        for(var i in indices_json){
        	var field_json = indices_json[i];

            //RuleField is created to validate properties, not to use
        	var field_creation = RuleField.create_field(field_json);
            var err = field_creation[0];

            console.log(err);
            if(err!=null){
                indices_validator.invalid(i,err);
                continue;
            }

            field.indices[i] = field_json;
        }

        var indices_error = indices_validator.end();
        if(indices_error){
            field.validator.invalid("indices", indices_error)
        }
    }

    return field.validator.end();
}

ArrayRuleField.prototype.create_checks = function(validator){
    var field = this;

    field.checks.push(BasicVal.array(field.required));

    field.checks.push(function(value,emit){

        var array_validator = new FieldVal(value);

        for(var i = 0; i < value.length; i++){
            var rule = field.rules[i];

            rule.validate_as_field(i, array_validator);
        }

        var array_error = array_validator.end();

        return array_error;
    });
}

if (typeof module != 'undefined') {
    module.exports = ArrayRuleField;
}