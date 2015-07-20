var grunt = require("grunt");

require("./../config.requirejs.js");

var rjs = require("requirejs");

grunt.registerTask('test', 'Test suite', function() {
	var done = this.async();

	rjs(["tests/Seed.js", "tests/Eventable.js", "tests/Extendable.js"], function(S, Ev,Ex){
		S.run();
		Ev.run();
		Ex.run(null,done);
	});

});