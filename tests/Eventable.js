define(["vows","assert", "seed-js/Eventable"], function(v, assert, Ev) {
  
  return v.describe("Eventable").addBatch({
    "Basic publisher/subscriber" : {
      "topic" : function() {
        var p = new Ev({
          "type" : "publisher",
        });
        var s1 = new (Ev.extend({
          "+init" : function(){
            this.reset();
          },
          
          "type" : "subscriber",
          
          onEvt : function() {
            this.firings.push({
              evt : "onEvt",
              args : arguments,
              scope : this
            });
          },
          
          reset : function() {
            this.firings = [];
          }
        }))(),
        s2 = new Ev();
        
        this.callback(null, {publisher : p, subscriber : s1, subscriber2 : s2});
        
      },
      
      "basic publish/subscribe" : function(err, o) {

        o.publisher.on("evt", o.subscriber);
        
        o.publisher.on("evt1", o.subscriber, "onEvt");
        
        o.publisher.on("evt2", o.subscriber, function() {
          this.onEvt.apply(this,arguments);
        });
        
        o.publisher.on("evt2", function() {
          this.onEvt.apply(this,arguments);
        }, o.subscriber);
        
        var a = "yo";
        o.publisher.on("evt", o.subscriber2, function(){
          a = "yi";
        });
        
        assert.isTrue(o.subscriber.firings.length === 0);
        
        o.publisher.fire("evt","a","b");
        
        assert.equal(a, "yi");
        assert.equal(o.subscriber.firings.length, 1);
        assert.equal(o.subscriber.firings[0].args[0], "a");
        assert.equal(o.subscriber.firings[0].args[1], "b");
        
        o.publisher.fire("evt");
        o.publisher.fire("evt1");
        o.publisher.fire("evt2");
        
        assert.equal(o.subscriber.firings.length, 5);
        
      },
      "detach" : {
        "topic" : function(o) {
          o.subscriber.reset();
          o.subscriber.detachAll();
          var bounds = [
            o.publisher.on("evt", o.subscriber),
            o.publisher.on("evt1", o.subscriber, "onEvt"),
            o.publisher.on("evt2", o.subscriber, function() {
              this.onEvt.apply(this,arguments);
            }),
            o.publisher.on("evt2", function() {
              this.onEvt.apply(this,arguments);
            }, o.subscriber)
          ];
          
          o.bounds = bounds;
          this.callback(null,o);
        },
        
        "detachAll" : function(err,o) {
          o.bounds[0].un();
          o.publisher.fire("evt");
          assert.equal(o.subscriber.firings.length, 0);
          
          o.publisher.fire("evt1");
          assert.equal(o.subscriber.firings.length, 1); 
          
          o.subscriber.detachAll();
          o.publisher.fire("*");
          assert.equal(o.subscriber.firings.length, 1);                    
          
        }
        
      }
    }
  });
});
