fieldval_ui_extend(FVRuleEditor, FVObjectField);

function FVRuleEditor(name, options){
	var editor = this;

    editor.base_fields = {};

	FVRuleEditor.superConstructor.call(this, name, options);

	var field_type_choices = [];
	var types = FVRule.FVRuleField.types;
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

FVRuleEditor.prototype.update_type_fields = function(){
	var editor = this;

	var type = editor.fields.type.val();
	for(var name in editor.fields){
		if(!editor.base_fields[name]){
			editor.fields[name].remove();
		}
	}

	if (type) {
		var rule_field = FVRule.FVRuleField.types[type].class;
		if (rule_field.create_editor_ui !== undefined) {
			rule_field.create_editor_ui(editor.val(), editor);
		}
	}
}