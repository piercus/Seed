sand.define("Seed/tests/Extendable", ["vows","assert", "Seed/Extendable"], function(r) {
  var v = r.vows,
      assert = r.assert,
      Ex = r.Extendable;
  
  return v.describe("Extendable").addBatch({
    "Basic extend" : {
      "topic" : function() {
        var A = Ex.extend({
          
          "name" : "AName",
          
          "setName" : function(name) {
            this.name = name;
          },
          
          "getName" : function() {
            return this.name;
          }
          
        });
        
        return A;
      },
      
      "make the right first-level object" : function(A) {

        assert.equal(A.prototype.name, "AName");

        var a = new A();
        assert.instanceOf(a, A);
        assert.equal(a.name, "AName");
        
        a.setName("aName");
        assert.equal(a.name, "aName");
        assert.equal(A.prototype.name, "AName");
        
        assert.equal(A.extend, Ex.extend);
      },
      
      "Second extend" : {
        "topic" : function(A) {
          var B = A.extend({
            "name" : "BName"
          });

          this.callback(B, A);
        },
        
        "make the right second-level Object" : function(B, A) {
          assert.equal(B.prototype.name, "BName");
          assert.equal(A.prototype.name, "AName");
          var b = new B();
          assert.instanceOf(b, B);
          assert.equal(b.name, "BName");
          
          B.prototype.name = "B2Name";
          assert.equal(A.prototype.name, "AName");
          assert.equal(B.prototype.name, "B2Name");
          assert.equal(b.name, "B2Name");
          
          b.setName("bName");
          assert.equal(b.name, "bName");
          assert.equal(B.prototype.name, "B2Name");
        },
        
      },
    },
    
    "+/- Extend" : {
      "topic" : function() {
        
        
        //-TO DO check return types for all this case
        var types = [{ 
            typeName : "object", 
            ex0 : { a: "aV", b : "bV"},
            ex1 : { b : "bV1", c : "cV1"}
          },{ 
            typeName : "array",
            ex0 : ["a", "b"],
            ex1 : ["b", "c"]
          },{
            typeName : "string",
            ex0 : "string0",
            ex1 : "string1"
          },{
            typeName : "number",
            ex0 : "string0",
            ex1 : "string1"
        }]
        //-end TODO
        
        var A = Ex.extend({
          
          "keyObject" : {
            "key1" : "A1ObjectValue",
            "key2" : "A2ObjectValue",
          },
          
          "+init" : function(name) {
            this.inited = true;
          },
          
          "method" : function() {
            this.doSomething = true;
            return { first :"Afirst", second : "Asecond"};
          },
          
          "+nonExistingMethod1" : function() {
            return "nonExistingMethod1";
          },
          
          "-nonExistingMethod2" : function() {
            return "nonExistingMethod2";
          }
        });
        
        return A
      },
      
      "make the right first-level + extend" : function(A) {
      
        var keys = ["init", "method", "nonExistingMethod1", "nonExistingMethod2"];
        
        for(var i in A.prototype) if(A.prototype.hasOwnProperty(i)) {

          if(typeof(A.prototype[i]) === "function"){
            assert.notEqual(keys.indexOf(i),-1);
          }
        }

        var a = new A();
        assert.isTrue(a.inited);
        assert.equal(a.nonExistingMethod1(), "nonExistingMethod1");
        assert.equal(a.nonExistingMethod2(), "nonExistingMethod2");
        
        a.method();
        assert.isTrue(a.doSomething);
      },
      
      "Second + extend" : {
        "topic" : function(A) {
          var B = A.extend({
          
            "+keyObject" : {
              "key1" : "B1ObjectValue",
              "key3" : "B3ObjectValue"
            },
            
            "+init" : function(name) {
              this.inited2 = true;
            },
            
            "+method" : function() {
              if(this.doSomething){
                this.doSomething2 = true;
              }
              return { second : "Bsecond"};
            }
           
          });
          
          this.callback(null, B, A);
        },
        
        "make the +ed instance" : function(err, B, A) {
          
          var b = new B();
          assert.isUndefined(b.doSomething2);
          var res = b.method();
          assert.isTrue(b.doSomething2);
          assert.equal(res.second, "Bsecond");
          assert.equal(res.first, "Afirst");
          assert.equal(b.keyObject.key1, "B1ObjectValue");
          assert.equal(b.keyObject.key2, "A2ObjectValue");
          assert.equal(b.keyObject.key3, "B3ObjectValue");          
        },
        
      },
      
      "Second - extend" : {
        "topic" : function(A) {
          var B = A.extend({
          
            "-keyObject" : {
              "key1" : "B1ObjectValue",
              "key3" : "B3ObjectValue"
            },
            
            "-init" : function(name) {
              this.inited2 = true;
            },
            
            "-method" : function() {
              if(this.doSomething){
                this.doSomething2 = true;
              }
              return { second : "Bsecond"};
            }
           
          });
          
          this.callback(null, B, A);
        },
        
        "make the -ed instance" : function(err, B, A) {
          
          var b = new B();
          assert.isUndefined(b.doSomething2);
          var res = b.method();
          assert.isUndefined(b.doSomething2);
          assert.equal(res.second, "Asecond");
          assert.equal(res.first, "Afirst");
          assert.equal(b.keyObject.key1, "A1ObjectValue");
          assert.equal(b.keyObject.key2, "A2ObjectValue");
          assert.equal(b.keyObject.key3, "B3ObjectValue");
        },
      }
    },
    
    "cstr extend" : {
    
      "topic" : function() {
        var A = Ex.extend({
          "cstr:+new" : function(instance) {
            this.instances[instance.id] = instance;
            instance.setReady(true);
          },
          
          "cstr:instances" : {},
          
          "+init" : function(o) {
            o.id && (this.id = o.id);
          },
          
          "cstr:find" : function(id) {
            return this.instances[id];
          },
          
          "setReady" : function () {
            this.ready = true;
          }
        });
        
        return A;
      },
      "make the -ed instance" : function(A) {
        var insts = [];
        for(var i in A.instances) if(A.instances.hasOwnProperty(i)){
          insts.push(A.instances[i]);
        }
        assert.equal(insts.length, 0);
        assert.isUndefined(A.find(45));
      },
      "add an instance to A" : {
        "topic" : function(A) {
          var a = new A({
            id : 45
          });

          this.callback(null, a, A);
        },
        "a is findable" : function(err, a, A) {
          assert.isTrue(a.ready);
          assert.equal(A.find(45), a);
        },
        "one level more" : { 
          "topic" : function(a, A) {

            var B = A.extend({
              "cstr:+find" : function(id) {
                this.lastSearched = id;
              },
              "cstr:instances" : []
            });

            this.callback(null, B, a, A);
          },
          
          "should +ed on cstr fn" : function(err, B, a, A) {
          
            assert.isUndefined(B.find(45));
            assert.equal(B.lastSearched, 45);
            
            assert.strictEqual(A.find(45), a);
            
            var b = new B({id: 28});
            assert.strictEqual(B.find(28), b);
          }
        }
      }
      
    },
    exceptions : {
      "when define +method and -method" : {
        "topic" : function(){
          
        }
      }
    }
  });
});
