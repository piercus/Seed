var rjs = require("requirejs")

rjs.config({
	baseUrl : "..",
	// find a way to remove those two hard path 
	paths : {
		"Array.nocomplex" : "seed-js/node_modules/array-nocomplex/app",	
		"String.nocomplex" : "seed-js/node_modules/string-nocomplex/app"	
	}
});

rjs(["seed-js/tests/Seed", "seed-js/tests/Eventable", "seed-js/tests/Extendable"], function(S, Ev,Ex){
	S.run();
	Ev.run();
	Ex.run()
});