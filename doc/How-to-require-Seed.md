## How to require Seed ?
### With requirejs 

    define("myModule", ["seed-js/Seed"], function(r){
      var S = r.Seed;
      /* code */
    });

### Stand-alone (in a browser using Seed.standalone.js)

var S = Seed;

## Tests

run tests

    npm install vows
    npm test

## Documentation

By now documentation is inside the code and uses JSDoc synthax.

## Contribute

Add an issue if you find bugs or please

*   Fork me
*   Add your tests
*   Make your contribution
*   Pass all the tests 
*   Add a pull request



