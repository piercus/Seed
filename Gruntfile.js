require("./tasks/test.js");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      jshint: {
        owned: {
          files : { src : ["src/*.js", "Gruntfile.js", "config.requirejs.js", "tests/*.js", "main.js"]},
          options : {
            sub : true,
            camelcase : true,
            forin : true,
            quotmark : "double"
          }
        },
        afterconcat: ["seed-js.merged.js"]
      },
      "requirejs": {
          compile : {
            options : {
              mainConfigFile: "config.requirejs.js",
              out: "seed-js.merged.js",
              name: "seed-js/Seed",
              optimize: "none"
            }
          },
          min:{
            options : {
              mainConfigFile: "./config.requirejs.js",
              out: "seed-js.min.js",
              name: "seed-js/Seed"
            }
          },
          standalone : {
            options : {
              mainConfigFile: "config.requirejs.js",
              include: ["./node_modules/requirejs/require.js"],
              out: "seed-js.standalone.js",
              name: "seed-js/Seed",
              wrap: {
                  start: "var Seed;(function() {",
                  end: "Seed = require(\"seed-js/Seed\");}());"
              },
            }
          }
      },
      test: {

      }
  });

  // Load the plugin that provides jshit and requirejs
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-requirejs");

  // Default task(s).
  grunt.registerTask("default", [
    "jshint:owned",
    "test",
    "requirejs:compile"
    ]);

};
