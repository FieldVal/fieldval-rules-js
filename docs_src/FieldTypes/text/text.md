Checks if the value is a string and checks any ```min_length``` or ```max_length``` that is specified.

* ```min_length``` uses BasicVal.min_length to check for a minimum character limit.
* ```max_length``` uses BasicVal.max_length to check for a maximum character limit.
* ```ui_type``` allows you to specify the way the field should be displayed when this field is displayed in UI. Valid values are ```text```, ```textarea```, ```password```. The default is ```text```.