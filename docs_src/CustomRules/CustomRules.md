You can extend FieldVal Rules with additional types by adding classes to FVRule with ```add_rule_type```.

```javascript
FVRuleField.add_rule_type({
    "name": "my_custom_field",
    "display_name": "My Custom Field",
    "class": MyCustomFieldClass
});
```

The easiest way to write a custom field is to ```extend``` ```FVRule.FVRuleField``` and override certain functions.

The class provided in this example creates an FVTextField UI field and validates a string with a format such as "abc1000" where "abc" is provided as the ```"prefix"``` parameter and a minimum integer value such as ```1000``` is provided as the "minimum_id" parameter.