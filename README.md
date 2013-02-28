# Seed.js 
Elegant inheritance, attributes and events, both for client-side and server-side JavaScript.

## Introduction

Seed.js is a part of the fjs project.
Seed.js is an abstract JavaScript Constructor, that would fullfill the following requirements :

*   **inheritance**, `Seed.extend` and the `"+method"` convention help you inherit fast and easily, see [Extend with Seed.js](Seed/blob/master/Extendable.md)
*   **attributes**, with easy and flexible `options` keyword, see [Manage attributes with 'options'](Seed/blob/master/options.md)
*   **events** and **subscriptions**, to avoid object persistance due to dirty event subscriptions see [Use events](Seed/blob/master/Events.md)
*   **sub**, build a sub object of a parent one see [What is it sub ?](Seed/blob/master/Events.md)

## Installation

### With NPM

    $ npm install seed-js

in your script add

    require("Seed");

### Client-side

    <script src="path/to/Seed.merged.js">
or

    <script src="path/to/Seed.min.js">

## Basic Usage
You can use sandjs synhtax to write both client and server-side code.
see [sandjs](http://github.com/fjs/sandjs) for more informations on sand.js.

    var S = sand.require("Seed/Seed", function(r){
      var S = r.Seed;
      /* code */
    });

see [How to require Seed.js](Seed/blob/master/How-to-require-Seed.md) for more ways to require Seed.js

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
*    **Extendable**, (in Seed/Extendable), extend objects protoypes gracefully with +/- convention see [Extend with Seed.js](Seed/blob/master/Extendable.md)
*    **Eventable**, (in Seed/Eventable), fire and subscribe event properly, see [Use events](Seed/blob/master/Eventable.md)
*    **options**, (in Seed/Seed), elegant attributes set. see [Manage attributes with 'options'](Seed/blob/master/options.md)
*    **sub**, (in Seed/Seed), elegant attributes set [What is sub ?](Seed/blob/master/sub.md)

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

## Authors

Pierre Colle, Sam Ton-That, Cyril Agosta

