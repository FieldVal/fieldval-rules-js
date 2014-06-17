var assert = require("assert")
var logger = require('tracer').console();
var ValidationRule = require('../fieldval-rules')

describe('ValidationRule', function() {

    describe('Construction', function() {

        it('should create a ValidationRule for a basic field', function(done) {

        	var vr = new ValidationRule();
        	var init_output = vr.init({
                description: "My description",
                name: "person",
                display_name: "Person",
                type: "nested",
                fields: {
                    first_name: {
                        display_name: "First Name",
                        type: "text",
                        min_length: 2,
                        max_length: 32
                    },
                    last_name: {
                        display_name: "Last Name",
                        type: "text",
                        min_length: 2,
                        max_length: 32
                    },
                    address: {
                        display_name: "Address",
                        description: "An address. This is a nested test.",
                        type: "nested",
                        fields: {
                            house_number: {
                                type: "number",
                                integer: true,
                                minimum: 1
                            },
                            line_1: {
                                type: "text"
                            },
                            line_2: {
                                type: "text"
                            },
                            line_3: {
                                type: "text"
                            },
                            country: {
                                type: "choice",
                                choices: ["UK","US"]
                            }
                        }
                    }
                }
            });
            assert.equal(init_output,null);

            var test_object = {
                first_name: "Marcus",
                last_name: "L",
                address: {
                    house_number: 37.5,
                    line_1: "40 Lorem Ipsum",
                    line_3: "This is line 3",
                    country: "ESP"
                }
            };
            
            var error = vr.validate(test_object);
            assert.deepEqual(
            	{
				    "invalid": {
				        "last_name": {
				            "error": 100,
				            "error_message": "Length is less than 2"
				        },
				        "address": {
				            "missing": {
				                "line_2": {
				                    "error_message": "Field missing.",
				                    "error": 1
				                }
				            },
				            "invalid": {
				                "house_number": {
				                    "error_message": "Incorrect field type. Expected integer.",
				                    "error": 2,
				                    "expected": "integer",
				                    "received": "number"
				                },
				                "country": {
				                    "error": 104,
				                    "error_message": "Value is not a valid choice"
				                }
				            },
				            "error_message": "One or more errors.",
				            "error": 0
				        }
				    },
				    "error_message": "One or more errors.",
				    "error": 0
				},
				error
			);

            done();
        });

        it('should validate a ValidationRule', function(done) {
            var vr = new ValidationRule();
            var type_object = {
                type: "string",
                maximum: 20//maximum isn't a valid field for a "string" field
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                {
                    "unrecognized": {
                        "maximum": {
                            "error_message": 'Unrecognized field.',
                            "error": 3 
                        }
                    },
                    "error_message": 'One or more errors.',
                    "error": 0 
                },
                init_result
            );

            done();
        });

		it('should create a ValidationRule for a single field', function(done) {
            var vr = new ValidationRule();
            var type_object = {
                type: "number",
                maximum: 20
            }
            var init_result = vr.init(type_object);
            assert.equal(init_result,null);
            
            var error = vr.validate(57);
            assert.deepEqual(
                {
                    "error": 103,
                    "error_message": "Value is greater than 20"
                },
                error
            );

            done();
        });

    });

});