if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

define("seed-js/Extendable", function() {

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
   * @export seed-js/Extendable
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
    if(typeof(args[0]) !== "boolean" || args[0] !== false){ inst.init.apply(inst, args);}
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

    var C = function(o) {
      C["new"].call(C, this, arguments);
    };
    
    //copy constructor ownProperty (i.e. extend and new)
    var attrs = clone(this);

    for (var i in attrs) if(attrs.hasOwnProperty(i)) {
      C[i] = attrs[i];
    }
    
    C.prototype = extend(new this(false), pm(this.prototype, obj));
    
    return C;
  };

  return Extendable;
  
});
