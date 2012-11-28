sand.define("Seed/Seed", ["Seed/Eventable", "Array/send"], function(r) {
  
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
