if((typeof require) === 'function'){
    extend = require('extend')
}
extend(FVBasicRuleField, FVRuleField);

function FVBasicRuleField(json, validator) {
    var field = this;

    FVBasicRuleField.superConstructor.call(this, json, validator);
}

FVBasicRuleField.prototype.init = function(){
    var field = this;
    return field.ui_field.init.apply(field.ui_field, arguments);    
}
FVBasicRuleField.prototype.remove = function(){
    var field = this;
    return field.ui_field.remove.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.in_array = function(){
    var field = this;
    return field.ui_field.in_array.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.in_key_value = function(){
    var field = this;
    return field.ui_field.in_key_value.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.change_name = function(name) {
    var field = this;
    return field.ui_field.change_name.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.disable = function() {
    var field = this;
    return field.ui_field.disable.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.enable = function() {
    var field = this;
    return field.ui_field.enable.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.name_val = function(){
    var field = this;
    return field.ui_field.name_val.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.val = function(){
    var field = this;
    return field.ui_field.val.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.error = function(){
    var field = this;
    return field.ui_field.error.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.blur = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}
FVBasicRuleField.prototype.focus = function(){
    var field = this;
    return field.ui_field.blur.apply(field.ui_field, arguments);
}

if (typeof module != 'undefined') {
    module.exports = FVBasicRuleField;
}