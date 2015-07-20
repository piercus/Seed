# Seed.js 
Elegant inheritance, attributes and events, both for client-side and server-side JavaScript.

## Introduction

Seed.js was a part of the fjs project.
Seed.js is an abstract JavaScript Constructor, that would fullfill the following requirements :

*   **inheritance**, `Seed.extend` and the `"+method"` convention help you inherit fast and easily, see [Extend with Seed.js](Seed/blob/master/Extendable.md)
*   **attributes**, with easy and flexible `options` keyword, see [Manage attributes with 'options'](Seed/blob/master/options.md)
*   **events** and **subscriptions**, to avoid object persistance due to dirty event subscriptions see [Use events](Seed/blob/master/Events.md)
*   **sub**, build a sub object of a parent one see [What is it sub ?](Seed/blob/master/Events.md)

## Installation

### With NPM

    $ npm install seed-js

in your script add

    require("seed-js");

### Client-side

#### If you use requirejs

    <script src="path/to/Seed.min.js">

then :

    require("seed-js/Seed", function(S){
      /* code */
    });

#### If you do not use requirejs

    <script src="path/to/Seed.standalone.min.js">

then Seed is a global variable :

    var S = Seed;

## Basic Usage

### Extend your own Constructors 

    var Fruit = S.extend({
      options : {
        // by default the fruit is Tasty
        isTasty : true,
        //and no one owns it
        owner : null
      },
      
      // i like to taste any fruit
      taste : function() {
        console.log("I like to taste a fruit");
      },
      
      dump : function() {
        return {
          objectType :  "a fruit"
        }
      }
    });
    
    var Banana = Fruit.extend({
      // by default the banana is owned by a banana eater and is yellow
      "+options" : {
        owner : "banana eater",
        color : "yellow"
      },
      
      // but the taste of the banana depends if it tasty
      "+taste" : function() {
        console.log(this.isTasty ? "GREAT!" : "beurk!");
      },
      
      "+dump" : function() {
        return {
          color : this.color
        }
      }
    });
    
### Instanciate them
    var oldBanana = new Banana({
      isTasty : false,
      color : "black",
      owner : "me"
    });
    
    // options are set as attributes in the instance
    oldBanana.isTasty 
    //=> false
    
    // +taste in Banana is executed after taste in Fruit
    oldBanana.taste();
    // I like to test fruits
    // beurk!
    
    var favoriteBanana = new r.Banana();
    
    favoriteBanana.taste(); 
    // I like to test fruits
    // GREAT!
    
    favoriteBanana.dump();
    //=> { color : "yellow", objectType : "a fruit"}

  
## More infos/usages

Seed.js is a package of 4 little Tools :
*    **Extendable**, (in seed-js/Extendable.js), extend objects protoypes gracefully with +/- convention see [Extend with Seed.js](Seed/blob/master/doc/Extendable.md)
*    **Eventable**, (in seed-js/Eventable.js), fire and subscribe event properly, see [Use events](Seed/blob/master/doc/Eventable.md)
*    **options**, (in seed-js/Seed.js), elegant attributes set. see [Manage attributes with 'options'](Seed/blob/master/doc/options.md)
*    **sub**, (in seed-js/Seed.js), elegant attributes set [What is sub ?](Seed/blob/master/doc/sub.md)

## Tests

run tests

    npm test

## Build

Build

    grunt

## Documentation

Documentation is inside the code and uses JSDoc synthax.

## Contribute

Add an issue if you find bugs or please

*   Fork me
*   Add your tests
*   Make your contribution
*   Pass all the tests 
*   Add a pull request

## Authors

Pierre Colle, Sam Ton-That, Cyril Agosta

