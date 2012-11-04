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

