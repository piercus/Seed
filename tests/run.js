require("./../config.requirejs.js");

var rjs = require("requirejs");

rjs(["tests/Seed.js", "tests/Eventable.js", "tests/Extendable.js"], function(S, Ev,Ex){
	S.run();
	Ev.run();
	Ex.run();
});