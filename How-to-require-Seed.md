## How to require Seed ?
### Inside a sandjs module

    sand.define("myModule", ["Seed/Seed"], function(r){
      var S = r.Seed;
      /* code */
    });

### With sandjs outside scope
    require("sandjs");
    var S = sand.require("Seed/Seed");
    /* code */

### With requirejs 

(Soon)

## Tests

run tests

    npm test

test uses sandcli and run on server-side with vowsjs
[sandcli](http://github.com/piercus/sandcli) provides a test command

## Documentation

By now documentation is inside the code and uses JSDoc synthax.

## Contribute

Add an issue if you find bugs or please

*   Fork me
*   Add your tests
*   Make your contribution
*   Pass all the tests 
*   Add a pull request



