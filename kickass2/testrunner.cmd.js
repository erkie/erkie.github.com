var testrunner = require("qunit");

path = require( "path" ).normalize( __dirname );

testrunner.run({code: path + "/src/class.js", tests: path + "/tests/test.class.js"});