### Manage attributes with 'options'

    
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

#### Use JSONSchema in options
See [json-schema.org] to more infos on JSONSchema, we use [http://geraintluff.github.com/tv4/] for validation.

    var C3 = C.extend({
      "+options" : {
        color : { pattern : "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", default : "#FFFFFF" },
        isOk : { default : true, type : "boolean" },
      }
    }); 
