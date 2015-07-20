define(["vows","assert", "seed-js/Seed"], function(v, assert, S) {
  
  return v.describe("Seed").addBatch({
    "2 models" : {
      "topic" : function() {
        var Color = S.extend({
          options : {
            hex : "000000",
            name : "black"
          }
        });
        
        var Drawing = S.extend({
          options : {
            author : null,
            price : null
          }
        });
        
        var publisher = new S({});
        
        this.callback(null, {Drawing : Drawing, Color : Color, p : publisher});
        
      },
      
      "one is sub object of the other" : function(err, o) {
        var pi = new (o.Drawing)({
          author : "picasso",
          price : 10000,
          remarque : "nice"
        });
        assert.equal(pi.author, "picasso");
        assert.equal(pi.price, 10000);
        assert.isUndefined(pi.remarque);
        
        var color = pi.sub(o.Color, {
          hex : "8F8F8F",
          name : "grey"
        });
        
        color.nbSell = 0;
        
        color.onSell = function(){
          this.nbSell++;
        };
        
        assert.equal(color.hex, "8F8F8F");
        assert.equal(color.name, "grey");
        
        o.p.on("sell", color);
        
        o.p.fire("sell");
        
        assert.equal(color.nbSell, 1);
        
        pi.destroy();
        o.p.fire("sell");
        
        assert.equal(color.nbSell, 1);        
      }
    },
    "options can be schema if there are defined with '$' : '$key'" : {
      topic : function(){
        var Color = S.extend({
          options : {
            "$hex" : { pattern : "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", default : "#FFFFFF" },
            name : "black"
          }
        });
        
        this.callback(null, { Color : Color });
      },
      "the options are filtered by json schema" : function(err, o) {

          
        assert.equal(o.Color.prototype.options["$hex"].default, "#FFFFFF");
        
        /*var Color2 = o.Color.extend({ options: { "hex": "test" } });
        assert.equal(typeof(Color2.prototype.options["$hex"]), "undefined");
        assert.equal(Color2.prototype.options.hex, "#FFFFFF");
        var Color3 = Color2.extend({ options: { "$hex" : { default : "#000000" } } });
        assert.equal(typeof(Color2.prototype.options["hex"]), "undefined");
        assert.equal(Color3.prototype.options["$hex"].default, "#000000"); */
        
        var errors = [];
        var errCb = function(e){
          errors.push(e);
        };
        
        var color = new o.Color({
          hex : "#8F8F8F",
          name : "grey",
          errCb : errCb
        });
                
        assert.equal(color.hex, "#8F8F8F");
        assert.equal(color.name, "grey"); 
        assert.equal(errors.length, 0); 
        
        var color2 = new o.Color({
          hex : "blabla",
          name : "grey",
          errCb : errCb
        });
                
        assert.equal(errors.length, 1);
        assert.equal(color2.hex, "#FFFFFF");
        
        assert.throws(function(){
          var color3 = new o.Color({
            hex : "blabla",
            name : "grey"
          });          
        },Error);
        
        
      }
    }
  });
});
