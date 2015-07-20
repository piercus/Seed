var requirejs = require("requirejs");
requirejs.config({
	baseUrl : ".",
	paths : {
		"seed-js" : "src",
		"Array" : "node_modules/Array",
		"String" : "node_modules/String",
	}
});