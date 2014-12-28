({
    baseUrl: "../..",
    optimize: "none",
    // TO DO find a way to remove those two hard path 
	paths : {
		"Array.nocomplex" : "seed-js/node_modules/array-nocomplex/app",	
		"String.nocomplex" : "seed-js/node_modules/string-nocomplex/app"	
	},
    name: "seed-js/Seed",
    out: "../Seed.merged.js",
})
