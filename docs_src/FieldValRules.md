FieldVal Rules allows you to define a rule using JSON which can be used to both validate data and build a UI. FieldVal Rules uses [FieldVal](/docs/fieldval/) and [FieldVal UI](/docs/fieldvalui/).

FieldVal Rules includes a set of standard rule fields such as Text, Number, Choice etc., but you can easily write your own.

To create a rule, create a ```new FVRule()``` and call ```.init(rule_json)``` on it with the JSON for your rule.

The rule JSON is validated and any errors will be returned by ```.init```.

In a browser, calling ```.create_form()``` on the ```FVRule``` will return a [FieldVal UI](/docs/fieldvalui/) field in a <form/> as shown.

Then use ```.validate(data,callback)``` on the ```FVRule``` to validate data against the rule and get a callback with the error, or ```null``` if there was no error.

This error object can then be inserted right back into the form using ```form.error(error)```.

####Run the code example to the right####

Try out FieldVal Rules yourself using CodePen by clicking the "Run on Codepen" button below the example.