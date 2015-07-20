if (typeof define !== "function") {
    var define = require("amdefine")(module);
}

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
