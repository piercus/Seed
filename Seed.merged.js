if (typeof(window) !== 'undefined') var sand = window.sand = {};
else var sand = global.sand = {};

(function(sand) {
  sand.env = typeof(window) === 'undefined' ? 'node' : 'browser';

  Array.prototype.last = String.prototype.last = function() {
    return this[this.length - 1];
  };

  Array.prototype.each = function(f) {
    for (var i = -1, n = this.length; ++i < n; ) f(this[i], i);
    return this;
  };

  var keys = function(o) {
    var r = [];
    for (var i in o) r.push(i);
    return r;
  };
  
  sand.grains = {};
  
  var Grain = function(name, requires, fn, options) {
    this._grains = {};
    this.exports = {};
    this.name = name;
    this.innerName = name.split('/').last();
    this.requires = requires;
    this.fn = fn;
    if (options) for (var i in options) this[i] = options[i];
  };
  
  Grain.prototype = {
    require : function(name) {
      return sand.getGrain(name).use(this, this);
    },
    
    use : function(local, sandbox, options, alias) {
      if (!local) local = this;
      if (!sandbox) sandbox = local;

      if (!sandbox._grains[this.name]) {
        sandbox._grains[this.name] = this;

        for (var i = this.requires.length; i--; ) {
          var split = this.requires[i].split('->');
          sand.getGrain(split[0]).use(this, sandbox, options, split[1] || null);
        }
        
        if (this.fn) {
          this.exports = this.fn(this.exports) || this.exports;
        }
      }
      
      local.exports[alias || this.innerName] = this.exports;
      return this.exports;
    }
  };
  
  sand.getGrain = function(name) {
    if (sand.grains[name]) {
      return sand.grains[name];
    }
    if (name.last() === '*') { // folder
      var lvl = name.split('/').length,
        subFolders = {},
        l = name.length - 2,
        searched = name.slice(0, l);
      if (sand.grains[name.slice(0, name.length - 2)]) return sand.grains[name.slice(0, name.length - 2)];
      for (var i in this.grains) {
        if (i.slice(0, l) === searched) {
          var join = i.split('/').slice(0, lvl).join('/');
          if (!this.grains[join]) subFolders[join + '/*'] = true;
          else subFolders[join] = true;
        }
      }
      return sand.define(name.slice(0, name.length - 2), keys(subFolders));
    }
    return sand.define(name);
  };

  sand.define = function(name, requires, fn, options) {
    if (typeof(requires) === 'function') {
      fn = requires;
      requires = [];
    }
    else if (typeof(requires) === 'undefined') requires = [];
    return this.grains[name] = new Grain(name, requires, fn, options);
  };
    
  var id = 0;
  
  sand.require = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 1) {
      var app = new Grain('require-' + ++id);
      return (sand.grains[args[0]].use(app, app, null));
    }
    
    //--- parsing the requires
    var requires,
      fn = args.last();
    if (typeof(fn) !== 'function') {
      requires = args;
      fn = null;
    }
    else {
      requires = args.slice(0, args.length - 1);
    }
    //---
    
    var app = new Grain('require-' + ++id);
    requires.each(function(require) {
      var split = require.split('->'); // little repetition here for performance reasons
      sand.getGrain(split[0]).use(app, app, null, split[1] || null);
    });
    if (fn) return (fn(app.exports));
  };
    
  sand.define('sand', function() {
    return sand;
  });
  
  sand.global = function(name, value) {
    if (sand.env === 'node') {
      return global[name] = value;
    }
    window[name] = value;
  };
  
})(sand);sand.define("Seed/Seed", ["Seed/Eventable", "Array/send"], function(r) {
  
  /**
  * @class Seed
  * @param {object} o configuration object
  * @example
  * 
  */
  
  return r.Eventable.extend({
  
    /**
    * init instance attributes
    *
    * @param {object} o configuration object
    */
    init : function(o) {
      
      //publisher init
      this._events = [];
      
      //subscriber init
      this._attached = [];
      
      this._subs = [];
      
      this._o = o;
      this.setOptions();
    },
    
    /**
    * no options by default
    */
    
    options : {},
    
    /**
    * keys declared in options are set as attribute in the instance
    */
    
    setOptions : function() {
      if (this.options) {
        for (var i in this.options) if (this.options.hasOwnProperty(i)) {
          if (typeof(this._o[i]) === "undefined") this[i] = this.options[i];
          else this[i] = this._o[i];
        }
      }
    },
    
    /**
    * Build a sub instance, that will be destroyed with this
    * @params {function} C Constructor of the sub instance
    * @params {object} o configuration options of the sub instance
    * @returns {object} c instance built
    */
    
    sub : function(C, o) {
      if (typeof(C) !== "function") {
        throw new Error("C is not a valid constructor");
      }
      var c = new C(this._subParams(o));
      this._subs.push(c);
      return c;
    },
    
    /**
    * Add custom keys in the sub configuratin object from this
    * 
    * @params {object} o start sub configuration object
    * @returns {object} o extended sub configuration object
    */
    
    subParams : function(o) {
      (o||(o={}));
      o._parent = this;
      return o;
    },
    
    /**
    * Destroy the objects, his events and his sub objects
    */
    
    destroy : function() {
      this.detachAll();
      for(var i = 0; i < this._subs.length; i++) { this._subs[i].destroy() }
    }
    
  });
  
});

sand.define("Seed/Eventable", [
    "Seed/Extendable",
    "Array/remove",
    "Array/map",
    "String/capitalize"
    
  ], function(r) {
  
  /**
  * For publishing events
  * @export Seed/Eventable 
  */
  
  return r.Extendable.extend({
    
    init : function() {
      this._events = {};
      this._attached = [];
    },
    
    /**
    * Publisher method, Fire an event
    *
    * @public
    * @param {string} eventName 
    * @param {..} [arguments] the arguments to pass through the event pipe
    *
    */
    
    fire : function(eventName) {
      
      var evs = this._events[eventName];
      if (evs) {
        var args = Array.prototype.slice.call(arguments, 1);
        
        // last subscribe is the first to be called
        for (var i = evs.length; i--; ) {
          //TODO profiling to this line 
          evs[i].fn.apply(evs[i].subscriber,args);
          //evs[i](args[0], args[1], args[2], args[3]);
        }
      }
      
    },
    
    /**
    * Publisher method, Subscribe to an event
    *
    * Note : it's important to provide an subscriber object to detach the event when the subscriber is destroyed, else you may have issues to destroy events
    *
    * @public
    * @param {String} eventName "*" means "all", subsribe multi events with "evt1 evt2 ..."
    * @param {Object|Function} subscriber if Object, the subscriber instance else the function to attach
    * @param {String|Function|Object} [functionPointer='subscriber."on"+eventName'] if the subscriber is an object, a string pointes to subscriber method, a function would be executed in the subscriber scope
    * @returns {Object} subscription 
    *
    * @example 
    // call subscriber.onStart when publisher fire "start"
    var sub = publisher.on("start", subscriber); 
    
    sub.un(); // stops the subscription
    
    // call subscriber.onStart when publisher fire "start" and subscriber.onEnd when publisher fire "end"
    publisher.on("start end", subscriber);
    
    // call subscriber.onPublisherStart when publisher fire "start"
    publisher.on("start", subscriber, "onPublisherStart"); 
    
    // call fn in the subscriber scope
    publisher.on("start", subscriber, fn); 
    
    // call fn in the subscriber scope (equivalent to previous), use for more compatibility with classic use
    publisher.on("start", fn, subscriber);
    
    // call fn when publisher fire start, use with caution when you'll never want to detach event at any destroy
    publisher.on("start", fn); 

    */
    
    on : function(eventName, subscriber, fn) { 
      
      var evts = eventName.split(" ");
      
      // multimorph API handling
      if (typeof(subscriber) === "function") {
        var oldFn = fn;
        fn = subscriber;
        subscriber = oldFn;
      }
      
      // multi events handling
      if (evts.length === 1) {
        return this._on(evts[0], subscriber, fn);
      } else {
        
        var ons = [];
        for(var i = 0 ; i < evts.length; i++) {
          ons[i].push(this._on(evtName, subscriber, fn));
        }
        
        return {
          un : function() {
            for(var i = 0 ; i < ons.length; i++) {
              ons[i].un();
            }
          }
        };
      }
    },
    
    /**
    * @private
    */
    
    _on : function(eventName, subscriber, f) {
      
      // subscriber format validation
      if(subscriber && typeof(subscriber.attach) !== "function") {
        throw new Error("The subscriber should have a attach(event) method");
        return;
      }
      
      // fn multimorphism handling
      if(typeof(f) === "string"){
        f = subscriber[f];
      } else if(typeof(f) === "undefined") {
        f = subscriber["on"+eventName.capitalize()];
      }
      
      if(typeof(f) !== "function") {
        throw new Error("Cannot find the function to subscribe to "+eventName);
        return;
      }
      
      var _this  = this,
          subObj = {fn : f, subscriber : subscriber},
          ret    = {
                     un : function() {
                       _this._rmSubscription(eventName, subObj);
                     }
                  };
      
      subscriber.attach(ret);
      
      (this._events[eventName] || (this._events[eventName] = [])).push(subObj);
      
      return ret;
    },
    
    /**
    * Publisher method, Remove a Subscription, private, use subscription.un()
    *
    * @private
    * @param {string} eventName
    * @param {object} subscription object 
    * 
    */
    
    _rmSubscription : function(eventName, subObj) {

      this._events[eventName].remove(subObj);
      if(this._events[eventName].length == 0) {
        delete this._events[eventName];
      }
    },
    
    /**
    *  Subscriber method
    *  Attach a subscription to this
    *  @param {object} subscription
    */
    
    attach : function(subscription) {
      this._attached.push(subscription);
    },
    
    /**
    *  Subscriber method
    *  Detach all subscription
    */
    
    detachAll : function() { 
      for (var i = 0; i < this._attached.length; i++) {
        this._attached[i].un();
      }
      this._attached = [];
    }
  });
    
});

sand.define("Seed/Extendable", [], function(r) {
  
  var clone = function(o) { // clones an object (only lvl 1, see hardClone)
        var res = {};
        for (var i in o) if (o.hasOwnProperty(i)) res[i] = o[i];
        return res;
      },
      extend = function(o) {
        for (var i = 1, n = arguments.length; i < n; i++) {
          var e = typeof(arguments[i]) === "object" || typeof(arguments[i]) === "function" ? arguments[i] : {};
          for (var j in e) if (e.hasOwnProperty(j)) {
            o[j] = e[j];
          }
        }
        return o;
      };

  /**
   * This is the basic extendable element, it is used by fjs.View, fjs.Controller and others ...
   * It allows user to specifies "+_String:methodName_" to augment set the + method of the prototype of the new element with the defined method
   * if A is extended and A has a method named "some_random_method",
   * if you do B = A.extend({
   *  "+some_random_method" : add
   * })
   * B.some_random_method <=> function() { 
   *  A.prototype.some_random_method();
   *  add();
   * }
   * @export Seed/Extendable
   */
  var Extendable = function() {};
  
  /**
  * Initialize an object
  *
  * @this {Extendable}
  * @param {Object} configuration Object
  */
  
  Extendable.prototype.init = function(){};
  
  /**
  * Call init function from the cstructor signleton scope, useful to add custom afterNew/beforeNew callbacks
  *
  * @param {object} inst The instance scope
  * @param {array} args arguments
  */
  
  Extendable["new"] = function(inst, args){
    (typeof(args[0]) !== "boolean" || args[0] !== false) && inst.init.apply(inst, args);
  };

  /**
  * Mix two params, to get the better mix
  *
  * @private
  * @param {String|Array|Object|Number} before
  * @param {String|Array|Object|Number} after
  * @returns an extended object if before and after are objects
  */
 
  var extendReturn = function(before, after) {
    if(typeof(after) === "undefined") {
      return before;
    }

    if(typeof(after) === "object" && typeof(before) === "object"){
      return extend({}, before, after);
    }
    return after;
  };
  
  /**
  * Two Fns executed in once
  *
  * @private
  * @param {Object|Function} before a function or object that is executed before
  * @param  {Object|Function} after a function or object that is executed before
  * @returns {Object|Function} a function that calls before and then after
  */
  
  var mergeFns = function(before, after) {
    if (typeof(before) === "function" || typeof(after) === "function") {
      return function(){
        var beforeR = (typeof(before) === "function" ? 
                        before.apply(this, arguments) : 
                        before
                      ),
            afterR  = (typeof(after) === "function" ? 
                        after.apply(this, arguments) : 
                        after
                      );
        
        return extendReturn(beforeR, afterR);
      };    
    } else {
      return extendReturn(before, after);
    }
    
  };
  
  /**
  * extend an object with +/- convention
  *
  * @private
  * @param {Object} oldObj an object to extend from
  * @param  {Object} a key-value object to add to oldObject, with +key and -key
  * @returns {Object} an extended object
  */
  
  var pm = function(oldObj, extendObj) {
    var resObj = {},
        nullFn = function(){};
    for (var i in extendObj) if (extendObj.hasOwnProperty(i)) {
      var reg = /(^\+|^-)(.*)/g;
      
      if(reg.test(i)) {
        var key = i.replace(reg, "$2"),
            old    = oldObj[key] || nullFn,
            extFn  = extendObj[i];
        
        switch(i.charAt(0)){
          case "+": 
            resObj[key] = mergeFns(old, extFn);
            break;
          case "-":
            resObj[key] = mergeFns(extFn, old);          
            break;
        }
      } else {
        resObj[i] = extendObj[i];
      }
    }
    return resObj;
  };
  
  /**
  * Split Configuration between instance extension and constructor extension, with the cstr: convention
  * 
  *
  * @private
  * @param {Object} obj instance/cstr configuration object
  * @returns {Object} result {instance : {}, cstr : {}} 
  */
  
  var splitExtend = function(obj) {
    var testStr = "cstr:", l = testStr.length, res = {instance : {}, cstr : {}};
    for(var i in obj) if(obj.hasOwnProperty(i)){
      if(i.slice(0,l) === testStr){
        res.cstr[i.slice(l)] = obj[i];
      } else {
        res.instance[i] = obj[i];
      }
    }
    return res;
  }
  
  /**
  * Singleton extend with +/- convention
  *
  * @private
  * @param {Object} basicObj configuration key-value object with +/-key 
  * @returns {Object} extObj 
  * 
  */
  
  var extendCstr = function(basicObj, extObj) {
    
    var Res;
    Res = function(o) {
      Res["new"].call(Res, this, arguments);
    };

    var attrs = extend({}, basicObj, pm(basicObj, extObj));

    for (var i in attrs) if(attrs.hasOwnProperty(i)) {
      Res[i] = attrs[i];
    }

    return Res;
  };
  
  /**
  * Extend a Constructor with +/- convention
  *
  * @public
  * @param {Object} obj configuration key-value object with "+key" or "-key" 
  * 
  */
  
  Extendable.extend = function(obj) {

    var extObj = splitExtend(obj),
        C      = extendCstr(this, extObj.cstr);
    
    C.prototype = extend(new this(false), pm(this.prototype, extObj.instance));

    return C;
  };
    
  return Extendable;
  
});

(sand.define("Array/remove", function() {
  
  Array.prototype.remove = function(v) {
    for (var i = this.length; i--; ) {
      if (this[i] === v) this.splice(i, 1);
    }
    return this;
  };
  
}));

(sand.define("Array/map", function() {
  
  //TOMATURE:debug
  var debug = this.debug;
  
  Array.prototype.map = function(fn, scope) { // returns a new array where elements are fn(this[i])
  //scope is here for node's map compatibility
    if (scope) fn = fn.bind(scope);
    var r = this.slice();
    if (typeof(fn) === "function") {
      for (var i = 0, n = r.length; i < n; i++) r[i] = fn(r[i], i);
    }
    else {
      debug.i && console.log('should not happen?');
      fn = fn.substr(2, fn.length);
      for (var i = 0, n = r.length; i < n; i++) r[i] = r[i][fn]();
    }
    return r;
  };
  
  Array.prototype.as = function(fn) {
    debug.w&&console.log("[WARNING]: deprecated, use map instead of as");
    return (Array.prototype.map.call(this, fn));
  };
  
}));

sand.define("String/capitalize", function() {
  String.prototype.capitalize = function() {
    return (this.charAt(0).toUpperCase() + this.slice(1));
  };
  
});

(sand.define("Array/send", function() {
  
  Array.prototype.send = function(method) {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 1);
    if (typeof(method) === 'string') {
      for (var i = -1, n = this.length; ++i < n; ) {
        this[i][method].apply(this[i], args);
      }
    }
    else for (var i = -1, n = this.length; ++i < n; ) method.apply({}, [this[i]].concat(args));
    return this;
  };
  
}));

