var FVRuleEditor = (function(){

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
        _fv_rules_extend = require('./fv_rules_extend');
    } else {
        throw new Error("fv_rules_extend() is missing");
    }
    var fv_rules_extend = _fv_rules_extend;

    fv_rules_extend(FVRuleEditor, FVForm);
	function FVRuleEditor(name, options){
		var editor = this;

	    editor.base_fields = {};

		FVRuleEditor.superConstructor.call(this, name, options);

		var field_type_choices = [];
		var types = FVRuleField.types;
		for(var i in types){
			if (types.hasOwnProperty(i)) {
				var field_type_class = types[i];

				var name = i;
				var display_name = field_type_class.display_name;
				if(display_name){
					field_type_choices.push([name, display_name])
				} else {
					field_type_choices.push(name);
				}
			}

		}

		editor.add_field("name", new FVTextField("Name"));
		editor.add_field("display_name", new FVTextField("Display Name"));
        editor.add_field("required", new FVBooleanField("Required"));
		editor.add_field("type", new FVChoiceField("Type", {
			choices: field_type_choices
		}).on_change(function(){
			editor.update_type_fields();
		}));

		for(var name in editor.fields){
			if (editor.fields.hasOwnProperty(name)) {
		    	editor.base_fields[name] = true;
			}
	    }

	    editor.update_type_fields();
	}

	FVRuleEditor.prototype.update_type_fields = function(value){
		var editor = this;

		var type = editor.fields.type.val();
		for(var name in editor.fields){
			if(!editor.base_fields[name]){
				editor.fields[name].remove();
			}
		}

		if (type) {
			var rule_field = FVRuleField.types[type].class;
			if (rule_field.add_editor_params !== undefined) {
				rule_field.add_editor_params(editor, value);
			}
		}
	}

	FVRuleEditor.prototype.val = function(set_val, options) {
		var editor = this;

		if (set_val) {
			editor.fields.type.val(set_val.type, {ignore_change: true});
			editor.update_type_fields(set_val);
			delete set_val.type;
		}
		return FVForm.prototype.val.apply(editor, arguments);
	}

	return FVRuleEditor;
}).call((typeof window !== 'undefined')?window:null);

if (typeof module != 'undefined') {
    module.exports = FVRuleEditor;
}
