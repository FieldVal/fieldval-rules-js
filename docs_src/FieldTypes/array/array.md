Checks if the value is an array and has the specified indices.

* ```min_length``` uses BasicVal.min_length to check for a minimum length of the array.
* ```max_length``` uses BasicVal.max_length to check for a maximum length of the array.
* ```indices``` is an object that defines the rules for array indices using "n" notation or absolute indices.

	You can use "*" (asterisk) to match all indices unless they are overriden by other patterns.
	
	"n" notation allow you to specify repeating patterns, e.g. "2n" matches indices 0,2,4,6,8 etc. and "2n+1" matches indices 1,3,5,7,9.

	You can also specify absolute indices which will override other patterns.