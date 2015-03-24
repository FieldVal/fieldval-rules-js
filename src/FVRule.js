var FVRule = (function(){

    var _FieldVal;
    if(this.FieldVal !== undefined){
        _FieldVal = this.FieldVal;
    } else if((typeof require) === "function"){
        _FieldVal = require("fieldval");
    } else {
        throw new Error("FieldVal Rules requires FieldVal");
    }
    var FieldVal = _FieldVal;
    var BasicVal = FieldVal.BasicVal;

    var _FVRuleField;
    if(this.FVRuleField !== undefined){
        _FVRuleField = this.FVRuleField;
    } else if((typeof require) === "function"){
        _FVRuleField = require("./fields/FVRuleField");    
    } else {
        throw new Error("FVRuleField is missing");
    }
    var FVRuleField = _FVRuleField;

    function FVRule() {
        var vr = this;
    }

    FVRule.FVRuleField = FVRuleField;

    //Performs validation required for saving
    FVRule.prototype.init = function(json, options) {
        var vr = this;

        var field_res = FVRuleField.create_field(json, options);

        //There was an error creating the field
        if(field_res[0]){
            return field_res[0];
        }

        //Keep the created field
        vr.field = field_res[1];
        return null;
    }

    FVRule.add_rule_type = function(){
        var vr = this;

        return FVRule.FVRuleField.add_rule_type.apply(FVRule.FVRuleField, arguments);
    }

    FVRule.prototype.create_form = function(){
        var vr = this;

        return vr.create_ui(true);
    }

    FVRule.prototype.create_ui = function(form){
        var vr = this;

        return vr.field.create_ui(form);
    }

    FVRule.prototype.validate = function() {
        var vr = this;
        return vr.field.validate.apply(vr.field,arguments);
    }

    FVRule.prototype.check = function(val, emit, done) {
        var vr = this;
        
        vr.field.validate(val,function(err){
            done(err);
        });
    }

    FVRule.add_rule_type({
        name: "text",
        display_name: "Text",
        class: (typeof FVTextRuleField) !== "undefined" ? FVTextRuleField : require("./fields/FVTextRuleField")
    });
    FVRule.add_rule_type({
        name: "string",
        display_name: "String",
        class: (typeof FVTextRuleField) !== "undefined" ? FVTextRuleField : require("./fields/FVTextRuleField")
    });
    FVRule.add_rule_type({
        name: "boolean",
        display_name: "Boolean",
        class: (typeof FVBooleanRuleField) !== "undefined" ? FVBooleanRuleField : require("./fields/FVBooleanRuleField")
    });
    FVRule.add_rule_type({
        name: "number",
        display_name: "Number",
        class: (typeof FVNumberRuleField) !== "undefined" ? FVNumberRuleField : require("./fields/FVNumberRuleField")
    });
    FVRule.add_rule_type({
        name: "object",
        display_name: "Object",
        class: (typeof FVObjectRuleField) !== "undefined" ? FVObjectRuleField : require("./fields/FVObjectRuleField")
    });
    FVRule.add_rule_type({
        name: "key_value",
        display_name: "Key Value",
        class: (typeof FVKeyValueRuleField) !== "undefined" ? FVKeyValueRuleField : require("./fields/FVKeyValueRuleField")
    });
    FVRule.add_rule_type({
        name: "array",
        display_name: "Array",
        class: (typeof FVArrayRuleField) !== "undefined" ? FVArrayRuleField : require("./fields/FVArrayRuleField")
    });
    FVRule.add_rule_type({
        name: "choice",
        display_name: "Choice",
        class: (typeof FVChoiceRuleField) !== "undefined" ? FVChoiceRuleField : require("./fields/FVChoiceRuleField")
    });
    FVRule.add_rule_type({
        name: "email",
        display_name: "Email",
        class: (typeof FVEmailRuleField) !== "undefined" ? FVEmailRuleField : require("./fields/FVEmailRuleField")
    });
    FVRule.add_rule_type({
        name: "date",
        display_name: "Date",
        class: (typeof FVDateRuleField) !== "undefined" ? FVDateRuleField : require("./fields/FVDateRuleField")
    });

    return FVRule;

}).call((typeof window !== "undefined")?window:null);

if (typeof module != "undefined") {
    module.exports = FVRule;
}