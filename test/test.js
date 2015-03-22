var assert = require("assert")
var FVRule = require('../src/FVRule')

var extend = require('extend');

var FieldVal = require('fieldval');
var BasicVal = FieldVal.BasicVal;

describe('FVRule', function() {

    describe('Basic usage', function() {

        it('should create an FVRule for a basic field', function(done) {

        	var vr = new FVRule();
        	var init_output = vr.init({
                description: "My description",
                name: "person",
                display_name: "Person",
                "type": "object",
                fields: [
                    {
                        name: "first_name",
                        display_name: "First Name",
                        "type": "text",
                        min_length: 2,
                        max_length: 32
                    },{
                        name: "last_name",
                        display_name: "Last Name",
                        "type": "text",
                        min_length: 2,
                        max_length: 32
                    },{
                        name: "address",
                        display_name: "Address",
                        description: "An address. This is a object test.",
                        "type": "object",
                        fields: [
                            {
                                name: "house_number",
                                "type": "number",
                                integer: true,
                                minimum: 1
                            },{
                                name: "line_1",
                                "type": "text"
                            },{
                                name: "line_2",
                                "type": "text"
                            },{
                                name: "line_3",
                                "type": "text"
                            },{
                                name: "country",
                                "type": "choice",
                                choices: ["UK","US"]
                            }
                        ]
                    }
                ]
            });
            assert.strictEqual(init_output,null);

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
            
            vr.validate(test_object, function(error){
                assert.deepEqual({
                    "invalid": {
                        "last_name": {
                            "error": 100,
                            "error_message": "Length is less than 2"
                        },
                        "address": {
                            "invalid": {
                                "line_2": {
                                    "error_message": "Field missing.",
                                    "error": 1
                                },
                                "house_number": {
                                    "error_message": "Incorrect field type. Expected integer, but received number.",
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
                            "error": 5
                        }
                    },
                    "error_message": "One or more errors.",
                    "error": 5
                },error);

                done();
            });
        });

        it('should validate an FVRule', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "string",
                maximum: 20//maximum isn't a valid field for a "string" field
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                {
                    "invalid": {
                        "maximum": {
                            "error_message": 'Unrecognized field.',
                            "error": 3 
                        }
                    },
                    "error_message": 'One or more errors.',
                    "error": 5 
                },
                init_result
            );

            done();
        });

        it('shouldn\'t allow "object" fields to be created with any" and "fields"', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "object",
                "any": true,
                "fields": [
                    {
                        "name": "my_inner",
                        "type": "text"
                    }
                ]
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                {
                    "invalid": {
                        "any": {
                            "error": 505,
                            "error_message": "'any' can't be used with 'fields'."
                        } 
                    },
                    "error_message": 'One or more errors.',
                    "error": 5 
                },
                init_result
            );

            done();
        });

        it('should allow "object" fields to be created without "fields" or "any"', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "object",
                "fields":[]
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                null,
                init_result
            );

            vr.validate({}, function(err){
                assert.strictEqual(null,init_result);
            })

            vr.validate({"test":1}, function(err){
                assert.deepEqual({ 
                    "invalid": {
                        "test": {
                            "error_message": 'Unrecognized field.',
                            "error": 3
                        }
                    },
                    "error_message": 'One or more errors.',
                    "error": 5
                },err);
            })

            done();
        });

		it('should create an FVRule for a single field', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "number",
                "maximum": 20
            }
            var init_result = vr.init(type_object);
            assert.strictEqual(init_result,null);
            
            vr.validate(57, function(error){
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

        it('should create an FVRule for an array field with 1 absolute index', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {
                    "*": {
                        "type": "text"
                    },
                    "1": {
                        "type": "number"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.strictEqual(init_result,null);
            
            vr.validate([
                "One",2,"Three"
            ],function(error){
                assert.deepEqual(
                    null,
                    error
                );
                done();    
            });
        });

        it('shouldn\'t allow an "array" field to be created with incomplete indices', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {}
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                init_result,
                {
                    "invalid":{
                        "indices":{
                            "error":504,
                            "error_message":"Incomplete indices pattern"
                        }
                    },
                    "error_message":"One or more errors.",
                    "error":5
                }
            );

            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {
                    "3n": {
                        "type": "text"
                    },
                    "3n+0": {
                        "type": "number"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                init_result,
                {
                    "invalid":{
                        "indices":{
                            "invalid":{
                                "3n+0":{
                                    "error":502,
                                    "error_message":"Index already present."
                                }
                            },
                            "error_message":"One or more errors.",
                            "error":5
                        }
                    },
                    "error_message":"One or more errors.",
                    "error":5
                }
            )

            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {
                    "2": {
                        "type": "text"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                init_result,
                {
                    "invalid":{
                        "indices":{
                            "error":504,
                            "error_message":"Incomplete indices pattern"
                        }
                    },
                    "error_message":"One or more errors.",
                    "error":5
                }
            );

            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {
                    "3n": {
                        "type": "text"
                    },
                    "3n+1": {
                        "type": "number"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                init_result,
                {
                    "invalid":{
                        "indices":{
                            "error":504,
                            "error_message":"Incomplete indices pattern",
                            "missing": ["3n+2"]
                        }
                    },
                    "error_message":"One or more errors.",
                    "error":5
                }
            );

            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "max_length": 4,
                "indices": {
                    "0": {
                        "type": "text"
                    },
                    "2": {
                        "type": "number"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.deepEqual(
                init_result,
                {
                    "invalid":{
                        "indices":{
                            "error":504,
                            "error_message":"Incomplete indices pattern",
                            "missing": ["1","3"]
                        }
                    },
                    "error_message":"One or more errors.",
                    "error":5
                }
            );

            done();
        });

        it('should create an FVRule for an array field with an interval rule', function(done) {
            var vr = new FVRule();
            var type_object = {
                "type": "array",
                "indices": {
                    "3n": {
                        "type": "text"
                    },
                    "3n+1": {
                        "type": "boolean"
                    },
                    "3n+2": {
                        "type": "number"
                    }
                }
            }
            var init_result = vr.init(type_object);
            assert.strictEqual(init_result,null);
            
            vr.validate([
                "One",true,3,"Four",true,6,"Seven",false,9
            ], function(error){
                assert.deepEqual(
                    null,
                    error
                );

                done();
            });
        });

        it('should allow continuing validation after use of a rule', function(done) {
            var validator = new FieldVal();
            var type_object = {
                "type": "object",
                fields: [
                    {
                        "name": "one",
                        "type": "number"
                    },
                    {
                        "name": "two",
                        "type": "number"
                    },
                    {
                        "name": "first_inner",
                        "type": "object",
                        "fields": [
                            {
                                "name": "shallow_1",
                                "type": "text"
                            },{
                                "name": "shallow_2",
                                "type": "text"
                            },{
                                "name": "shallow_3",
                                "type": "text"
                            },{
                                "name": "second_inner",
                                "type": "object",
                                "fields": [
                                    {
                                        "name": "third_inner",
                                        "type": "object",
                                        "fields": [
                                            {
                                                "name": "deep_key",
                                                "type": "number"
                                            },{
                                                "name": "another_deep_key",
                                                "type": "number"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            var ObjectRuleField = FVRule.FVRuleField.types['object'].class;
            var object_rule_field = new ObjectRuleField(type_object);
            object_rule_field.init();
            
            var my_data = {
                "one": "not a number",
                "first_inner": {
                    "shallow_1": "My shallow 1",
                    "shallow_2": 11,
                    "second_inner" : {
                        "third_inner" : {
                            "deep_key": 15,
                            "another_deep_key": "not an integer"
                        }
                    }
                }
            }

            object_rule_field.validate(my_data, function(error){
                var expected_error = {
                    "invalid": {
                        "two": {
                            "error_message": "Field missing.",
                            "error": 1
                        },
                        "one": {
                            "error_message": "Incorrect field type. Expected number, but received string.",
                            "error": 2,
                            "expected": "number",
                            "received": "string"
                        },
                        "first_inner": {
                            "invalid": {
                                "shallow_3": {
                                    "error_message": "Field missing.",
                                    "error": 1
                                },
                                "shallow_2": {
                                    "error_message": "Incorrect field type. Expected string, but received number.",
                                    "error": 2,
                                    "expected": "string",
                                    "received": "number"
                                },
                                "second_inner": {
                                    "invalid": {
                                        "third_inner": {
                                            "invalid": {
                                                "another_deep_key": {
                                                    "error_message": "Incorrect field type. Expected number, but received string.",
                                                    "error": 2,
                                                    "expected": "number",
                                                    "received": "string"
                                                }
                                            },
                                            "error_message": "One or more errors.",
                                            "error": 5
                                        }
                                    },
                                    "error_message": "One or more errors.",
                                    "error": 5
                                }
                            },
                            "error_message": "One or more errors.",
                            "error": 5
                        }
                    },
                    "error_message": "One or more errors.",
                    "error": 5
                }

                assert.deepEqual(
                    expected_error,
                    error
                );

                var validator = new FieldVal(my_data, error);
                assert.deepEqual(
                    expected_error,
                    validator.end()
                )
                
                var path_to_third_inner = ["first_inner","second_inner","third_inner"];
                var dug = validator.dig(path_to_third_inner);

                dug.invalid("deep_key", {
                    "error_message": "This is an error added after rule validation",
                    "error": 1000
                })

                validator.invalid(path_to_third_inner, dug.end());

                var final_error = validator.end();

                var final_expected_error = {
                    "invalid": {
                        "two": {
                            "error_message": "Field missing.",
                            "error": 1
                        },
                        "one": {
                            "error_message": "Incorrect field type. Expected number, but received string.",
                            "error": 2,
                            "expected": "number",
                            "received": "string"
                        },
                        "first_inner": {
                            "invalid": {
                                "shallow_3": {
                                    "error_message": "Field missing.",
                                    "error": 1
                                },
                                "shallow_2": {
                                    "error_message": "Incorrect field type. Expected string, but received number.",
                                    "error": 2,
                                    "expected": "string",
                                    "received": "number"
                                },
                                "second_inner": {
                                    "invalid": {
                                        "third_inner": {
                                            "invalid": {
                                                "deep_key": {
                                                    "error_message": "This is an error added after rule validation",
                                                    "error": 1000
                                                },
                                                "another_deep_key": {
                                                    "error_message": "Incorrect field type. Expected number, but received string.",
                                                    "error": 2,
                                                    "expected": "number",
                                                    "received": "string"
                                                }
                                            },
                                            "error_message": "One or more errors.",
                                            "error": 5
                                        }
                                    },
                                    "error_message": "One or more errors.",
                                    "error": 5
                                }
                            },
                            "error_message": "One or more errors.",
                            "error": 5
                        }
                    },
                    "error_message": "One or more errors.",
                    "error": 5
                }

                assert.deepEqual(
                    final_expected_error,
                    final_error
                );

                done();
            });
        });

    });

    describe('Custom fields', function(){
        it('should allow adding custom field types', function(){

            extend(CustomLocationRuleField, FVRule.FVRuleField);
            function CustomLocationRuleField(json, validator) {
                var field = this;

                CustomLocationRuleField.superConstructor.call(this, json, validator);
            }

            CustomLocationRuleField.prototype.init = function() {
                var field = this;

                field.minimum = field.validator.get("minimum", BasicVal.number(false));
                field.maximum = field.validator.get("maximum", BasicVal.number(false));
                field.integer = field.validator.get("integer", BasicVal.boolean(false));
                
                field.checks.push(BasicVal.object(field.required), function(val, emit){
                    var inner_validator = new FieldVal(val);

                    var inner_checks = [BasicVal.number(true,{})];

                    if(field.minimum){
                        inner_checks.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
                    }
                    if(field.maximum){
                        inner_checks.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
                    }
                    if(field.integer){
                        inner_checks.push(BasicVal.integer(true,{stop_on_error:false}));
                    }

                    inner_validator.get("x", inner_checks);
                    inner_validator.get("y", inner_checks);

                    var error = inner_validator.end();
                    if(error) return error;
                });

                return field.validator.end();
            }

            FVRule.FVRuleField.add_field_type({
                name: "custom_location_field",
                display_name: "Custom Location Field",
                class: CustomLocationRuleField
            });

            var vr = new FVRule();
            var init_output = vr.init({
                name: "location",
                display_name: "Location",
                type: "custom_location_field",
                integer: true
            });

            var error = vr.validate({
                "x": 123.4,
                "y": "abc"
            }, function(error){
                var expected = {
                    invalid:{
                        x:{
                            error_message: 'Incorrect field type. Expected integer, but received number.',
                            error: 2,
                            expected: 'integer',
                            received: 'number' 
                        },
                        y:{
                            error_message: 'Incorrect field type. Expected number, but received string.',
                            error: 2,
                            expected: 'number',
                            received: 'string' 
                        }
                    },
                    error_message: 'One or more errors.',
                    error: 5
                }
                assert.deepEqual(error, expected);
            });
        })

        it('should support async checks', function(done){

            extend(CustomRuleField, FVRule.FVRuleField);
            function CustomRuleField(json, validator) {
                var field = this;

                CustomRuleField.superConstructor.call(this, json, validator);
            }

            CustomRuleField.prototype.init = function() {
                var field = this;
                
                field.checks.push(BasicVal.number(field.required), function(val, emit, done){
                    setTimeout(function(){
                        done({
                            "error": 1000,
                            "error_message": "Delayed error"
                        });
                    },10);
                });

                return field.validator.end();
            }

            FVRule.FVRuleField.add_field_type({
                name: "custom_field",
                display_name: "Custom Field",
                class: CustomRuleField
            });

            var vr = new FVRule();
            var init_output = vr.init({
                name: "place",
                type: "object",
                fields:[{
                    name: "async_test",
                    display_name: "Async Test",
                    type: "custom_field"
                }]
            });

            var sync_error = vr.validate({
                async_test: 123
            }, function(error){
                assert.deepEqual(error, {
                    "error": 5,
                    "error_message": "One or more errors.",
                    "invalid": {
                        "async_test": {
                            "error": 1000,
                            "error_message": "Delayed error"
                        }
                    }
                });
                done();
            });
        })
    });

});