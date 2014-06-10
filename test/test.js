var assert = require("assert")
var logger = require('tracer').console();
var ValidationRule = require('../src/ValidationRule')

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
			logger.log(init_output);
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

            logger.log(JSON.stringify(error,null,4));

            done();
        });

		it('should create a ValidationRule for a single field', function(done) {
            var vr = new ValidationRule();
            var type_object = {
                description: "A simple number field",
                name: "my_number",
                display_name: "My Number",
                type: "number",
                maximum: 20
            }
            var init_result = vr.init(type_object);
            logger.log(JSON.stringify(init_result,null,4));
            assert.equal(init_result,null);
            
            var error = vr.validate(57);

            logger.log(JSON.stringify(error,null,4));

            done();
        });

    });

});