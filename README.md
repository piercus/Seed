# Seed.js 
Elegant inheritance, attributes and events, both for client-side and server-side JavaScript.

## Introduction

Seed.js is a part of the fjs project.
Seed.js is a abstract JavaScript Constructor, that woulf fullfill the following requirements :

*   **inheritance**, `Seed.extend` and the `"+method"` convention help you inherit fast and easily, see [What is different in Seed.js inheritance ?]
*   **attributes**, with easy and flexible `options` keyword, see [What is this options ?]
*   **events** and **subscriptions**, to avoid object persistance due to dirty event subscriptions see [Events in Seed.js]

## Installation

### With NPM

    $ npm install Seedjs

in your script add

    require("Seed");

### Client-side
    <script src="path/to/Seed.merged.js">
    
## Basic Usage
You can use sandjs synhtax to write both client and server-side code.
see [sandjs](http://github.com/fjs/sandjs) for more informations on sand.js.
    var S = sand.require("Seed", function(r){
      var S = r.Seed;
      /* code */
    });
    
if you don't want to use this module synthax see [More usages to require Seed.js]

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
  });
  
## More infos/usages

Seed.js is a package of 4 little Tools :
*    **Extendable**, (in Seed/Extendable), extend objects protoypes gracefully with +/- convention
*    **Eventable**, (in Seed/Eventable), fire and subscribe event properly
*    **options**, (in Seed/Seed), elegant attributes set
*    **sub**, (in Seed/Seed), elegant attributes set

### Extendable
#### +init Example
In good inheritance system, where init is the function call at object instanciation you often do this :
    var C2 = C.extend({
      init : function(o) {
        C.prototype.init.apply(this, arguments);
        /* some stuff 0 here */
      },
      
      method1 : function() {
        /* some stuff 1 here */
        C.prototype.method1.apply(this, arguments);
      }
    });

You can rewrite it and avoid repeating method names with Seed.js

     var C2 = C.extend({
       "+init" : function(o) {
         /* some stuff 0 here */
       },
       
       "-method1" : function() {
        /* some stuff 1 here */
      }
     });

It promote code-reuse between subClass and super class, the sub class do not know whet the super class do

#### What does it returns

Without Seed.js, it would look like this : 

    var C2 = C.extend({
    
      method1 : function() {
        var before = /* some stuff 1 here */
        var after = C.prototype.method1.apply(this, arguments);
        return merge(before, after);
      },
      
      // or in the other way
      method2 : function() {
        var before = C.prototype.method2.apply(this, arguments);
        var after = /* some stuff 2 here */
        return merge(before, after);
      }
      
    });
    
equivalent to


     var C2 = C.extend({
       "-method1" : function(o) {
         return /* some stuff 1 here */
       },
       
       "+method2" : function() {
         return /* some stuff 2 here */
       }
     });

`merge(before, after)` apply the following rules :
*   if, between `after` and `before`, an object is undefined, return the other
*   if `before` and `after` are objects, merge objects
*   else return `after`

#### With objects

Now `C` is having object in his prototype

    C.prototype.colors = {
      "grey" : "#888888",
      "black" : "#FFFFFF"
    };
    
You can do 

    var C2 = C.extend({
    
      colors : merge(C.prototype.colors, {
        white : "#000000"
      })
      
    });
Equivalent to 

     var C2 = C.extend({
    
      "+colors" : {
        white : "#000000"
      }
      
    });
#### Do not use -init AND +init in the same .extend

if you want to do stuff before and after the parent's function, use 

    var C2 = C.extend({
       "method3" : function() {
         /* some stuff here */
         C.prototype.method3.apply(this, arguments);
         /* some stuff here */         
       }
     });

### Eventable
The event system let you subscribe and fire event. Seed is both a publisher and a subscriber.
    // S a class inheriting from Seed
    
    // p is our publisher
    var p  = new S();

#### Subscribe with a subscriber
In a basic approach, an event is simply a publisher, an eventName and a function. It's true, (see [Subscribe just a function]), but when you do that, you might detach the subscription by hand when you don't need it.

Attach a subscriber, in practice is a good way to manage life-cycle of the subscription, to detach it. In short if your JavaScript is Object-Oriented with events, you will need to explicity attach the subscription to the subscriber.

With Seed.js it looks like 

    // subscribe an event, if exists 
    var S1 = S.extend({
      "onEvt1" : function() {
        /* code 0 , has to be called on evt1 */
      },
      
      "alsoOnEvt1" : function() {
        /* code 1, has to be called on evt1 */
      }
    });
    
    var s1 = new S1();
    
    // call s1.onEvt1 on "evt1"
    p.on("evt1", s1);

    // call s1.alsoOnEvt1 on "evt1"
    p.on("evt1", s1, "alsoOnEvt1");
    
    // call /* custom code */ on "evt1"
    p.on("evt1", s1, function(){ /* code 3, custom code */ });

The subscriber s1 is an object, that has chances to be destroyed
    // if we destroy s1, subscription will be detached
    s1.destroy();

#### Subscribe just a function

    p.on("evt1", function() {/* custom code */});

#### Fire an event

    p.fire("evt1");
    
#### Detach
the detach function is useful just from the subscriber, cause the publisher do not know who is subscribing what event, else it would call functions explicitly.

    //detach all the events s1 subscribed
    s1.detachAll();
    
    //detach one subscription
    var subscription = p.on("evt2", s1);
    subscription.un();

### Options

    
If you want your instances to have attributes, and default values, you could do

    var C2 = C.extend({
      init : function(o) {
        this.color = o.color || "#FFFFFF";
        this.isOk = (typeof(o.isOk) === "undefined" ? true : o.isOk);
      }
    });
Equivalent to 

    var C2 = C.extend({
      options : {
        color : "#FFFFFF",
        isOk : true
      }
    });
    
but here you override the options key of yot superclass, so combine it with the "+" mecanism :

    var C2 = C.extend({
      "+options" : {
        color : "#FFFFFF",
        isOk : true
      }
    });

### sub
Always obn life-cycle problems, sub let you instanciate sub-instance, so when the parent object is destroyed, sub objects are destroyed too.

    var File = S.extend({
      options : {
        title : "untilted"
      }
    });
    
    var Computer = S.extend({
      /* computer stuff */
    });
    
    var c = new Computer();
    var f = c.sub(File, { title : "Banana.js" });
    
    // when i destroy the computer, the file is destroyed with it
    c.destroy();

#### Going further with sub
Same example as before but we can, in a elegant way, using Seed's subParams method, manage a reference between computer and file

    var File = S.extend({
      options : {
        title : "untilted",
        computer : null
      },
      
      "+init" : function() {
        this.computer.files.push(this);
      },
      
      "+destroy" : function() {
        this.computer.files.remove(this);
      }
    });
    
    var Computer = S.extend({
      options : {
        files : []
      },
      
      /* computer stuff */
      // subParams function can be extended
      "+subParams" : function() {
        return { computer : this };
      }
    });
    
    var c = new Computer();
    var f = c.sub(File, { /* init options*/ });
    
    // we now have references
    f.computer
    computer.files 


## More usages to require Seed.js

    var S = require("Seed");
    
### Inside a sandjs module

    sand.define(["Seed"], function(r){
      var S = r.Seed;
      /* code */
    });

### With sandjs outside scope

    var S = sand.require("Seed");
    /* code */

### Server-side with node

    var S = require("Seed");
    /* code */

### With requirejs 

(Soon)

## Tests
test uses sandcli and run on server-side with vowsjs
[sandcli](http://github.com/piercus/sandcli) provides a test command
    $sand test

## Documentation

By now documentation is inside the code and uses JSDoc synthax.

## Contribute

Add an issue if you find bugs or please

*   Fork me
*   Add your tests
*   Make your contribution
*   Pass all the tests 
*   Add a pull request



