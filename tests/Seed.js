sand.define("Seed/tests/Seed", ["vows","assert", "Seed/Seed"], function(r) {
  var v = r.vows,
      assert = r.assert,
      S = r.Seed;
  
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
    }
  });
});
