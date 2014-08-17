if((typeof require) === 'function'){
    extend = require('extend')
}
extend(BasicRuleField, RuleField);

function BasicRuleField(json, validator) {
    var field = this;

    BasicRuleField.superConstructor.call(this, json, validator);
}

BasicRuleField.prototype.init = function(){
    var field = this;
    return field.ui_field.init.apply(field.ui_field, arguments);    
}
BasicRuleField.prototype.remove = function(){
    var field = this;
    return field.ui_field.remove.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.in_array = function(){
    var field = this;
    return field.ui_field.in_array.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.view_mode = function(){
    var field = this;
    return field.ui_field.view_mode.apply(field.ui_field, arguments);    
}
BasicRuleField.prototype.edit_mode = function(){
    var field = this;
    return field.ui_field.edit_mode.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.change_name = function(name) {
    var field = this;
    return field.ui_field.change_name.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.disable = function() {
    var field = this;
    return field.ui_field.disable.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
BasicRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

if (typeof module != 'undefined') {
    module.exports = BasicRuleField;
}