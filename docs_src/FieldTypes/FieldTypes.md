FieldVal Rules uses fields that specify their own parameters in order to build validation checks.

A basic field is shown to the right. It has the following keys:

* ```name``` - When this field is part of any object, this is the key - optional apart from when the child of an object field.
* ```display_name``` - The name the field will display when it is used to build UI.
* ```description``` - A description that is presented to the user in UI - optional.
* ```type``` - The type of field. The built-in types are described below.
* ```required``` - Whether or not this field is required. The field will not report an error if ```required``` is set to false and the value is not present - optional - defaults to ```true```.
* ```*field-specific-parameters*``` - Each field type has its own additional parameters. Check the documentation of the field type.

FieldVal Rules includes a set of rule fields that can be used to validate various field types such as numbers, text and booleans. The built-in rule fields are documented below.