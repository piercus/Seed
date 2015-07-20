var requirejs = require("requirejs");
require("./config.requirejs.js");
requirejs.config({ baseUrl : __dirname });
module.exports = requirejs("seed-js/Seed");