

test("creation of a class", function() {
	expect(3);
	
	var myMethod = function() {}
	var MyTestClass = new Class({
		aMethod: myMethod
	});
	
	equal(typeof MyTestClass, "function", "class should be function");
	equal(typeof MyTestClass.prototype.aMethod, "function", "method should be in prototype");
	equal(MyTestClass.prototype.aMethod, myMethod, "method should be myMethod");
});

test("instantiation of class", function() {
	expect(2);
	
	var NoConstructorClass = new Class({});
	
	var ConstructorClass = new Class({
		initialize: function() {}
	});
	
	ok(new NoConstructorClass, "class with no constructor should be instantiated");
	ok(new ConstructorClass, "class with constructor should be instantiated");
});

test("calling methods", function() {
	expect(2);
	
	var MyTestClass = new Class({
		initialize: function() {
			ok(true, "initialize should be called")
		},
		
		aMethod: function() {
			ok(true, "aMethod should be called");
		}
	});
	
	var myInstance = new MyTestClass();
	myInstance.aMethod();
});

test("return values", function() {
	expect(2);
	
	var MyTestClass = new Class({
		initialize: function() {
			// should not be returned to caller, this isn't objective-c!
			return "hello world";
		},
		
		aMethod: function() {
			return 42;
		}
	});
	
	var MyTestClass2 = new Class({
		initialize: function() {
			
		}
	});
	
	notEqual(new MyTestClass(), "hello world", "constructor should always return instantiated object");
	
	var instance = new MyTestClass();
	equal(instance.aMethod(), 42, "normal method return-values");
});

test("parameters of methods", function() {
	expect(3);
	
	var MyTestClass = new Class({
		initialize: function(param1, param2) {
			equal(param1, "hello", "first parameter of constructor");
			equal(param2, "world", "second parameter of constructor");
		},
		
		aMethod: function(param1) {
			equal(param1, "i'm a method", "parameter of method");
		}
	});
	
	var instance = new MyTestClass("hello", "world");
	instance.aMethod("i'm a method");
});

test("properties of instance", function() {
	expect(4);
	
	var Point = new Class({
		initialize: function(x, y) {
			this.x = x;
			this.y = y;
		},
		
		add: function(x, y) {
			this.x += x;
			this.y += y;
		}
	});
	
	var instance = new Point(10, 100);
	equal(instance.x, 10, "a property of an instance");
	equal(instance.y, 100, "another property of an instance");
	
	instance.add(10, 50);
	equal(instance.x, 10+10, "using a property from a method");
	equal(instance.y, 100+50, "using a second property from a method");
});
