You can extend FieldVal Rules with additional types by adding classes to FVRule with ```add_rule_type```.

```javascript
FVRuleField.add_rule_type({
    "name": "my_custom_field",
    "display_name": "My Custom Field",
    "class": MyCustomFieldClass
});
```

The easiest way to write a custom field is to ```extend``` ```FVRule.FVRuleField``` and override certain functions.

A rule field that uses this type might look like:

```javascript
{
	"name": "my_prefixed_id",
	"display_name": "My Prefixed Id",
	"type": "my_custom_field",
	"prefix": "abc",
	"minimum_id": 1000
}
```

This rule will create an FVTextField UI field and validates a string with a format such as "abc1541" where "abc" is provided as the ```"prefix"``` parameter and a minimum integer value such as ```1000``` is provided as the "minimum_id" parameter.