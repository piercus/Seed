

define("seed-js/Extendable", [],function() {

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

(define("Array/remove", [],function() {
  
  Array.prototype.remove = function(v) {
    for (var i = this.length; i--; ) {
      if (this[i] === v) this.splice(i, 1);
    }
    return this;
  };
  
}));

(define("Array/map", [],function() {

  Array.prototype.map = function(fn, scope) { // returns a new array where elements are fn(this[i])
  //scope is here for node's map compatibility
    if (scope){ fn = fn.bind(scope);}
    var r = this.slice(),i,n;
    if (typeof(fn) === "function") {
      for (i = 0, n = r.length; i < n; i++){ r[i] = fn(r[i], i);}
    }
    else {
      fn = fn.substr(2, fn.length);
      for (i = 0, n = r.length; i < n; i++){ r[i] = r[i][fn]();}
    }
    return r;
  };
  
}));

define("String/capitalize", [],function() {
  
  String.prototype.capitalize = function() {
    return (this.charAt(0).toUpperCase() + this.slice(1));
  };
  
});



define("seed-js/Eventable", [
    "seed-js/Extendable",
    "Array/remove",
    "Array/map",
    "String/capitalize"
  ], function(Extendable) {
  
  /**
  * For publishing events
  * @export seed-js/Eventable 
  */
  
  return Extendable.extend({
    
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
      }
      
      // fn multimorphism handling
      if(typeof(f) === "string"){
        f = subscriber[f];
      } else if(typeof(f) === "undefined") {
        f = subscriber["on"+eventName.capitalize()];
      }
      
      if(typeof(f) !== "function") {
        throw new Error("Cannot find the function to subscribe to "+eventName);
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
      if(this._events[eventName].length === 0) {
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

/**
Author: Geraint Luff
Year: 2013

This code is released into the "public domain" by its author.  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
**/


define("seed-js/lib/tv4", [],function(){
  function validateAll(data, schema) {
  	if (schema['$ref'] != undefined) {
  		schema = global.tv4.getSchema(schema['$ref']);
  		if (!schema) {
  			return null;
  		}
  	}
  	var error = false;
  	return validateBasic(data, schema)
  		|| validateNumeric(data, schema)
  		|| validateString(data, schema)
  		|| validateArray(data, schema)
  		|| validateObject(data, schema)
  		|| validateCombinations(data, schema)
  		|| null;
  }

  function recursiveCompare(A, B) {
  	if (A === B) {
  		return true;
  	}
  	if (typeof A == "object" && typeof B == "object") {
  		if (Array.isArray(A) != Array.isArray(B)) {
  			return false;
  		} else if (Array.isArray(A)) {
  			if (A.length != B.length) {
  				return false
  			}
  			for (var i = 0; i < A.length; i++) {
  				if (!recursiveCompare(A[i], B[i])) {
  					return false;
  				}
  			}
  		} else {
  			for (var key in A) {
  				if (B[key] === undefined && A[key] !== undefined) {
  					return false;
  				}
  			}
  			for (var key in B) {
  				if (A[key] === undefined && B[key] !== undefined) {
  					return false;
  				}
  			}
  			for (var key in A) {
  				if (!recursiveCompare(A[key], B[key])) {
  					return false;
  				}
  			}
  		}
  		return true;
  	}
  	return false;
  }

  function validateBasic(data, schema) {
  	var error;
  	if (error = validateType(data, schema)) {
  		return error.prefixWith(null, "type");
  	}
  	if (error = validateEnum(data, schema)) {
  		return error.prefixWith(null, "type");
  	}
  	return null;
  }

  function validateType(data, schema) {
  	if (schema.type == undefined) {
  		return null;
  	}
  	var dataType = typeof data;
  	if (data == null) {
  		dataType = "null";
  	} else if (Array.isArray(data)) {
  		dataType = "array";
  	}
  	var allowedTypes = schema.type;
  	if (typeof allowedTypes != "object") {
  		allowedTypes = [allowedTypes];
  	}
	
  	for (var i = 0; i < allowedTypes.length; i++) {
  		var type = allowedTypes[i];
  		if (type == dataType || (type == "integer" && dataType == "number" && (data%1 == 0))) {
  			return null;
  		}
  	}
  	return new ValidationError("invalid data type: " + dataType);
  }

  function validateEnum(data, schema) {
  	if (schema["enum"] == undefined) {
  		return null;
  	}
  	for (var i = 0; i < schema["enum"].length; i++) {
  		var enumVal = schema["enum"][i];
  		if (recursiveCompare(data, enumVal)) {
  			return null;
  		}
  	}
  	return new ValidationError("No enum match for: " + JSON.stringify(data));
  }
  function validateNumeric(data, schema) {
  	return validateMultipleOf(data, schema)
  		|| validateMinMax(data, schema)
  		|| null;
  }

  function validateMultipleOf(data, schema) {
  	var multipleOf = schema.multipleOf || schema.divisibleBy;
  	if (multipleOf == undefined) {
  		return null;
  	}
  	if (typeof data == "number") {
  		if (data%multipleOf != 0) {
  			return new ValidationError("Value " + data + " is not a multiple of " + multipleOf);
  		}
  	}
  	return null;
  }

  function validateMinMax(data, schema) {
  	if (typeof data != "number") {
  		return null;
  	}
  	if (schema.minimum != undefined) {
  		if (data < schema.minimum) {
  			return new ValidationError("Value " + data + " is less than minimum " + schema.minimum).prefixWith(null, "minimum");
  		}
  		if (schema.exclusiveMinimum && data == schema.minimum) {
  			return new ValidationError("Value "+ data + " is equal to exclusive minimum " + schema.minimum).prefixWith(null, "exclusiveMinimum");
  		}
  	}
  	if (schema.maximum != undefined) {
  		if (data > schema.maximum) {
  			return new ValidationError("Value " + data + " is greater than maximum " + schema.maximum).prefixWith(null, "maximum");
  		}
  		if (schema.exclusiveMaximum && data == schema.maximum) {
  			return new ValidationError("Value "+ data + " is equal to exclusive maximum " + schema.maximum).prefixWith(null, "exclusiveMaximum");
  		}
  	}
  	return null;
  }
  function validateString(data, schema) {
  	return validateStringLength(data, schema)
  		|| validateStringPattern(data, schema)
  		|| null;
  }

  function validateStringLength(data, schema) {
  	if (typeof data != "string") {
  		return null;
  	}
  	if (schema.minLength != undefined) {
  		if (data.length < schema.minLength) {
  			return (new ValidationError("String is too short (" + data.length + " chars), minimum " + schema.minLength)).prefixWith(null, "minLength");
  		}
  	}
  	if (schema.maxLength != undefined) {
  		if (data.length > schema.maxLength) {
  			return (new ValidationError("String is too long (" + data.length + " chars), maximum " + schema.maxLength)).prefixWith(null, "maxLength");
  		}
  	}
  	return null;
  }

  function validateStringPattern(data, schema) {
  	if (typeof data != "string" || schema.pattern == undefined) {
  		return null;
  	}
  	var regexp = new RegExp(schema.pattern);
  	if (!regexp.test(data)) {
  		return new ValidationError("String does not match pattern").prefixWith(null, "pattern");
  	}
  	return null;
  }
  function validateArray(data, schema) {
  	if (!Array.isArray(data)) {
  		return null;
  	}
  	return validateArrayLength(data, schema)
  		|| validateArrayUniqueItems(data, schema)
  		|| validateArrayItems(data, schema)
  		|| null;
  }

  function validateArrayLength(data, schema) {
  	if (schema.minItems != undefined) {
  		if (data.length < schema.minItems) {
  			return (new ValidationError("Array is too short (" + data.length + "), minimum " + schema.minItems)).prefixWith(null, "minItems");
  		}
  	}
  	if (schema.maxItems != undefined) {
  		if (data.length > schema.maxItems) {
  			return (new ValidationError("Array is too long (" + data.length + " chars), maximum " + schema.maxItems)).prefixWith(null, "maxItems");
  		}
  	}
  	return null;
  }

  function validateArrayUniqueItems(data, schema) {
  	if (schema.uniqueItems) {
  		for (var i = 0; i < data.length; i++) {
  			for (var j = i + 1; j < data.length; j++) {
  				if (recursiveCompare(data[i], data[j])) {
  					return (new ValidationError("Array items are not unique (indices " + i + " and " + j + ")")).prefixWith(null, "uniqueItems");
  				}
  			}
  		}
  	}
  	return null;
  }

  function validateArrayItems(data, schema) {
  	if (schema.items == undefined) {
  		return null;
  	}
  	var error;
  	if (Array.isArray(schema.items)) {
  		for (var i = 0; i < data.length; i++) {
  			if (i < schema.items.length) {
  				if (error = validateAll(data[i], schema.items[i])) {
  					return error.prefixWith(null, "" + i).prefixWith("" + i, "items");
  				}
  			} else if (schema.additionalItems != undefined) {
  				if (typeof schema.additionalItems == "boolean") {
  					if (!schema.additionalItems) {
  						return (new ValidationError("Additional items not allowed")).prefixWith("" + i, "additionalItems");
  					}
  				} else if (error = validateAll(data[i], schema.additionalItems)) {
  					return error.prefixWith("" + i, "additionalItems");
  				}
  			}
  		}
  	} else {
  		for (var i = 0; i < data.length; i++) {
  			if (error = validateAll(data[i], schema.items)) {
  				return error.prefixWith("" + i, "items");
  			}
  		}
  	}
  	return null;
  }
  function validateObject(data, schema) {
  	if (typeof data != "object" || data == null || Array.isArray(data)) {
  		return null;
  	}
  	return validateObjectMinMaxProperties(data, schema)
  		|| validateObjectRequiredProperties(data, schema)
  		|| validateObjectProperties(data, schema)
  		|| validateObjectDependencies(data, schema)
  		|| null;
  }

  function validateObjectMinMaxProperties(data, schema) {
  	var keys = Object.keys(data);
  	if (schema.minProperties != undefined) {
  		if (keys.length < schema.minProperties) {
  			return new ValidationError("Too few properties defined (" + keys.length + "), minimum " + schema.minProperties).prefixWith(null, "minProperties");
  		}
  	}
  	if (schema.maxProperties != undefined) {
  		if (keys.length > schema.maxProperties) {
  			return new ValidationError("Too many properties defined (" + keys.length + "), maximum " + schema.maxProperties).prefixWith(null, "maxProperties");
  		}
  	}
  	return null;
  }

  function validateObjectRequiredProperties(data, schema) {
  	if (schema.required != undefined) {
  		for (var i = 0; i < schema.required.length; i++) {
  			var key = schema.required[i];
  			if (data[key] === undefined) {
  				return new ValidationError("Missing required property: " + key).prefixWith(null, "" + i).prefixWith(null, "required")
  			}
  		}
  	}
  	return null;
  }

  function validateObjectProperties(data, schema) {
  	var error;
  	for (var key in data) {
  		var foundMatch = false;
  		if (schema.properties != undefined && schema.properties[key] != undefined) {
  			foundMatch = true;
  			if (error = validateAll(data[key], schema.properties[key])) {
  				return error.prefixWith(key, key).prefixWith(null, "properties");
  			}
  		}
  		if (schema.patternProperties != undefined) {
  			for (var patternKey in schema.patternProperties) {
  				var regexp = new RegExp(patternKey);
  				if (regexp.test(key)) {
  					foundMatch = true;
  					if (error = validateAll(data[key], schema.patternProperties[patternKey])) {
  						return error.prefixWith(key, patternKey).prefixWith(null, "patternProperties");
  					}
  				}
  			}
  		}
  		if (!foundMatch && schema.additionalProperties != undefined) {
  			if (typeof schema.additionalProperties == "boolean") {
  				if (!schema.additionalProperties) {
  					return new ValidationError("Additional properties not allowed").prefixWith(key, "additionalProperties");
  				}
  			} else {
  				if (error = validateAll(data[key], schema.additionalProperties)) {
  					return error.prefixWith(key, "additionalProperties");
  				}
  			}
  		}
  	}
  	return null;
  }

  function validateObjectDependencies(data, schema) {
  	var error;
  	if (schema.dependencies != undefined) {
  		for (var depKey in schema.dependencies) {
  			if (data[depKey] !== undefined) {
  				var dep = schema.dependencies[depKey];
  				if (typeof dep == "string") {
  					if (data[dep] === undefined) {
  						return new ValidationError("Dependency failed - key must exist: " + dep).prefixWith(null, depKey).prefixWith(null, "dependencies");
  					}
  				} else if (Array.isArray(dep)) {
  					for (var i = 0; i < dep.length; i++) {
  						var requiredKey = dep[i];
  						if (data[requiredKey] === undefined) {
  							return new ValidationError("Dependency failed - key must exist: " + requiredKey).prefixWith(null, "" + i).prefixWith(null, depKey).prefixWith(null, "dependencies");
  						}
  					}
  				} else {
  					if (error = validateAll(data, dep)) {
  						return error.prefixWith(null, depKey).prefixWith(null, "dependencies");
  					}
  				}
  			}
  		}
  	}
  	return null;
  }

  function validateCombinations(data, schema) {
  	var error;
  	return validateAllOf(data, schema)
  		|| validateAnyOf(data, schema)
  		|| validateOneOf(data, schema)
  		|| validateNot(data, schema)
  		|| null;
  }

  function validateAllOf(data, schema) {
  	if (schema.allOf == undefined) {
  		return null;
  	}
  	var error;
  	for (var i = 0; i < schema.allOf.length; i++) {
  		var subSchema = schema.allOf[i];
  		if (error = validateAll(data, subSchema)) {
  			return error.prefixWith(null, "" + i).prefixWith(null, "allOf");
  		}
  	}
  }

  function validateAnyOf(data, schema) {
  	if (schema.anyOf == undefined) {
  		return null;
  	}
  	var errors = [];
  	for (var i = 0; i < schema.anyOf.length; i++) {
  		var subSchema = schema.anyOf[i];
  		var error = validateAll(data, subSchema);
  		if (error == null) {
  			return null;
  		}
  		errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
  	}
  	return new ValidationError("Data does not match any schemas from \"anyOf\"", "", "/anyOf", errors);
  }

  function validateOneOf(data, schema) {
  	if (schema.oneOf == undefined) {
  		return null;
  	}
  	var validIndex = null;
  	var errors = [];
  	for (var i = 0; i < schema.oneOf.length; i++) {
  		var subSchema = schema.oneOf[i];
  		var error = validateAll(data, subSchema);
  		if (error == null) {
  			if (validIndex == null) {
  				validIndex = i;
  			} else {
  				return new ValidationError("Data is valid against more than one schema from \"oneOf\": indices " + validIndex + " and " + i, "", "/oneOf");
  			}
  		} else {
  			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "oneOf"));
  		}
  	}
  	if (validIndex == null) {
  		return new ValidationError("Data does not match any schemas from \"oneOf\"", "", "/oneOf", errors);
  	}
  	return null;
  }

  function validateNot(data, schema) {
  	if (schema.not == undefined) {
  		return null;
  	}
  	var error = validateAll(data, schema.not);
  	if (error == null) {
  		return new ValidationError("Data matches schema from \"not\"", "", "/not")
  	}
  	return null;
  }

  // parseURI() and resolveUrl() are from https://gist.github.com/1088850
  //   -  released as public domain by author ("Yaffle") - see comments on gist

  function parseURI(url) {
  	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
  	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
  	return (m ? {
  		href     : m[0] || '',
  		protocol : m[1] || '',
  		authority: m[2] || '',
  		host     : m[3] || '',
  		hostname : m[4] || '',
  		port     : m[5] || '',
  		pathname : m[6] || '',
  		search   : m[7] || '',
  		hash     : m[8] || ''
  	} : null);
  }

  function resolveUrl(base, href) {// RFC 3986

  	function removeDotSegments(input) {
  		var output = [];
  		input.replace(/^(\.\.?(\/|$))+/, '')
  			.replace(/\/(\.(\/|$))+/g, '/')
  			.replace(/\/\.\.$/, '/../')
  			.replace(/\/?[^\/]*/g, function (p) {
  				if (p === '/..') {
  					output.pop();
  				} else {
  					output.push(p);
  				}
  		});
  		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
  	}

  	href = parseURI(href || '');
  	base = parseURI(base || '');

  	return !href || !base ? null : (href.protocol || base.protocol) +
  		(href.protocol || href.authority ? href.authority : base.authority) +
  		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
  		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
  		href.hash;
  }

  function normSchema(schema, baseUri) {
  	if (baseUri == undefined) {
  		baseUri = schema.id;
  	} else if (typeof schema.id == "string") {
  		baseUri = resolveUrl(baseUri, schema.id);
  		schema.id = baseUri;
  	}
  	if (typeof schema == "object") {
  		if (Array.isArray(schema)) {
  			for (var i = 0; i < schema.length; i++) {
  				normSchema(schema[i], baseUri);
  			}
  		} else if (typeof schema['$ref'] == "string") {
  			schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
  		} else {
  			for (var key in schema) {
  				if (key != "enum") {
  					normSchema(schema[key], baseUri);
  				}
  			}
  		}
  	}
  }

  function ValidationError(message, dataPath, schemaPath, subErrors) {
  	this.message = message;
  	this.dataPath = dataPath ? dataPath : "";
  	this.schemaPath = schemaPath ? schemaPath : "";
  	this.subErrors = subErrors ? subErrors : null;
  }
  ValidationError.prototype = {
  	prefixWith: function (dataPrefix, schemaPrefix) {
  		if (dataPrefix != null) {
  			dataPrefix = dataPrefix.replace("~", "~0").replace("/", "~1");
  			this.dataPath = "/" + dataPrefix + this.dataPath;
  		}
  		if (schemaPrefix != null) {
  			schemaPrefix = schemaPrefix.replace("~", "~0").replace("/", "~1");
  			this.schemaPath = "/" + schemaPrefix + this.schemaPath;
  		}
  		if (this.subErrors != null) {
  			for (var i = 0; i < this.subErrors.length; i++) {
  				this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
  			}
  		}
  		return this;
  	}
  };

  function searchForTrustedSchemas(map, schema, url) {
  	if (typeof schema.id == "string") {
  		if (schema.id.substring(0, url.length) == url) {
  			var remainder = schema.id.substring(url.length);
  			if ((url.length > 0 && url.charAt(url.length - 1) == "/")
  				|| remainder.charAt(0) == "#"
  				|| remainder.charAt(0) == "?") {
  				if (map[schema.id] == undefined) {
  					map[schema.id] = schema;
  				}
  			}
  		}
  	}
  	if (typeof schema == "object") {
  		for (var key in schema) {
  			if (key != "enum" && typeof schema[key] == "object") {
  				searchForTrustedSchemas(map, schema[key], url);
  			}
  		}
  	}
  	return map;
  }

  var publicApi = {
  	schemas: {},
  	validate: function (data, schema) {
  		if (typeof schema == "string") {
  			schema = {"$ref": schema};
  		}
  		this.missing = [];
  		var added = this.addSchema("", schema);
  		var error = validateAll(data, schema);
  		for (var key in added) {
  			delete this.schemas[key];
  		}
  		this.error = error;
  		if (error == null) {
  			return true;
  		} else {
  			return false;
  		}
  	},
  	addSchema: function (url, schema) {
  		var map = {};
  		map[url] = schema;
  		normSchema(schema, url);
  		searchForTrustedSchemas(map, schema, url);
  		for (var key in map) {
  			this.schemas[key] = map[key];
  		}
  		return map;
  	},
  	getSchema: function (url) {
  		if (this.schemas[url] != undefined) {
  			var schema = this.schemas[url];
  			return schema;
  		}
  		var baseUrl = url;
  		var fragment = "";
  		if (url.indexOf('#') != -1) {
  			fragment = url.substring(url.indexOf("#") + 1);
  			baseUrl = url.substring(0, url.indexOf("#"));
  		}
  		if (this.schemas[baseUrl] != undefined) {
  			var schema = this.schemas[baseUrl];
  			var pointerPath = decodeURIComponent(fragment);
  			if (pointerPath == "") {
  				return schema;
  			} else if (pointerPath.charAt(0) != "/") {
  				return undefined;
  			}
  			var parts = pointerPath.split("/").slice(1);
  			for (var i = 0; i < parts.length; i++) {
  				var component = parts[i].replace("~1", "/").replace("~0", "~");
  				if (schema[component] == undefined) {
  					schema = undefined;
  					break;
  				}
  				schema = schema[component];
  			}
  			if (schema != undefined) {
  				return schema;
  			}
  		}
  		if (this.missing[baseUrl] == undefined) {
  			this.missing.push(baseUrl);
  			this.missing[baseUrl] = baseUrl;
  		}
  	},
  	missing: [],
  	error: null,
  	normSchema: normSchema,
  	resolveUrl: resolveUrl
  };

  return publicApi;
});



define("seed-js/Seed", [
  "seed-js/Eventable", 
  "seed-js/lib/tv4"
  ], function(Eventable, tv4) {
  

  /**
  * @class Seed
  * @param {object} o configuration object
  * @example
  * 
  */
  
  return Eventable.extend({
  
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
      
      this._o = o || {};
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
      var schemaErrors = [];
      
      if (this.options) {
        for (var i in this.options) if (this.options.hasOwnProperty(i)) {
          
          if(i.charAt(0) !== "$"){ //normal {key : defaultValue} option definition
            if (typeof(this._o[i]) === "undefined") this[i] = this.options[i];
            else this[i] = this._o[i];            
          } else {  // json schema option definition 
            var key = i.substr(1),
                schema = this.options[i];            
            if(typeof(this._o[key]) === "undefined" && schema.default) this[i] = schema.default;
            else if(typeof(this._o[key]) !== "undefined"){
              if(tv4.validate(this._o[key], schema)){
                this[key] = this._o[key];
              } else {
                schemaErrors.push(tv4.error); 
                if(schema.default){ this[key] = schema.default; }
              }
            }
          }
        }
      }
      
      if(this._o.errCb){ this.errCb = this._o.errCb; }
      
      if(schemaErrors.length > 0 && this.errCb){
        this.errCb(schemaErrors);        
      } else if(schemaErrors.length > 0){
        throw Error(schemaErrors);
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
      var c = new C(this.subParams(o));
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
      if(!o){o={};}
      o._parent = this;
      return o;
    },
    
    /**
    * Destroy the objects, his events and his sub objects
    */
    
    destroy : function() {
      this.detachAll();
      for(var i = 0; i < this._subs.length; i++) { this._subs[i].destroy(); }
    }
    
  });
  
});

