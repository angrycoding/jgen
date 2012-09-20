var Class = (function() {
	
	function wrapConstructorForBase(oConstructor, oSuperClass) {
		if (!oConstructor && !oSuperClass) return oConstructor;
		var oWrapped;
		if (oConstructor) {
			var callsBase = /this\.base/.test(oConstructor);
			if (!callsBase && !oSuperClass) return oConstructor;
			if (!callsBase) oWrapped = function() {
				oSuperClass.apply(this, arguments);
				return oConstructor.apply(this, arguments);
			}; else oWrapped = function() {
				var prev = this.base;
				this.base = (oSuperClass || function(){});
				var result = oConstructor.apply(this, arguments);
				this.base = prev;
				return result;
			};
		} else oWrapped = function() { return oSuperClass.apply(this, arguments); }
		oWrapped.valueOf = function() { return oConstructor; }
		oWrapped.toString = function() { return String(oConstructor); }
		return oWrapped;
	}
	
	function callFactory(klass, args) {
		var fn = klass.prototype.__factory__.apply(klass, args);
		if ('function' !== typeof(fn)) throw new Error('Factory function doesn\'t return a function');
		fn.__factoryFn__ = true;
		return fn;
	}
	
	function createFactoryObjects(obj) {
		if (obj.__createFactoryObjects) {
			obj.__createFactoryObjects();
			return;
		}
		//  Create declarative objects
		var p;
		var v;
		for (p in obj.__factories__) {
			v = obj[p];
			if (!v.__factoryFn__) continue;
			obj[p] = v.call(obj);
		}
	}
	
	function makeConstructor(oConstructor, oSuperClass) {
		if (oConstructor && !(oConstructor instanceof Function)) throw new Error('Invalid constructor');
		if (oSuperClass && !(oSuperClass instanceof Function)) throw new Error('Invalid superclass');
		//  Remove the postConstruct wrapping around the constructor for the superclass.
		oSuperClass = (oSuperClass ? oSuperClass.valueOf() : null);
		//  If the constructor calls this.base, wrap it with the appropriate stuff.
		oConstructor = wrapConstructorForBase(oConstructor, oSuperClass);
		var oWrapped;
		if (oConstructor) oWrapped = function() {
			if (!(this instanceof oWrapped)) return callFactory(oWrapped, arguments);
			var result = oConstructor.apply(this, arguments);
			if (result) return result;
			createFactoryObjects(this);
			if (this.__postConstruct instanceof Function) this.__postConstruct();
			return this;
		}; else oWrapped = function() {
			if (!(this instanceof oWrapped)) return callFactory(oWrapped, arguments);
			createFactoryObjects(this);
			if (this.__postConstruct instanceof Function) this.__postConstruct();
			return this;
		}
		//  make wrapped constructor look like the original
		oWrapped.valueOf = function() { return oConstructor; }
		oWrapped.toString = function() { return String(oConstructor || oWrapped); }
		return oWrapped;
	}
	
	function makePrototype(oSuperClass) {
		function silent() {}
		silent.prototype = oSuperClass.prototype;
		return new silent();
	}
	
	function wrapMethodForBase(method, name, superproto) {
		if (!method || !/this\.base/.test(method)) return method;
		function wrappedMethod() {
			var prev = this.base;
			this.base = (superproto[name] || function(){});
			var ret = method.apply(this, arguments);
			this.base = prev;
			return ret;
		}
		wrappedMethod.valueOf = function() { return method; }
		wrappedMethod.toString = function() { return String(method); }
		return wrappedMethod;
	}
	
	function addMember(proto, name, value, superproto) {
		//  determine whether value is a function that calls this.base()
		if (value instanceof Function && superproto) {
			var realValue = value.valueOf();
			value = wrapMethodForBase(value, name, superproto);
			value.name = name;
			if (realValue.__factoryFn__) proto.__factories__[name] = value;
		}
		proto[name] = value;
		return value;
	}
	
	function postSubclassNotification(newClass) {
		var klass;
		for (klass = newClass.superclass; klass; klass=klass.superclass) {
			if ('__subclassCreated__' in klass) {
				klass.__subclassCreated__(newClass);
			}
		}
	}
	
	return {
		
		create: function(oSuperClass, oDeclaration) {
			if (!arguments.length) throw new TypeError('Missing superclass and declaration arguments');
			var oPrototype = {};
			if (arguments.length == 1) {
				oDeclaration = oSuperClass;
				oSuperClass = undefined;
			} else oPrototype = makePrototype(oSuperClass);
			//  Allow oDeclaration to be a function that returns an object
			if ('function' == typeof(oDeclaration)) {
				oDeclaration = oDeclaration();
				if (!oDeclaration) throw new Error('Class declaration function did not return a prototype');
			}
			var oConstructor = null;
			if (oDeclaration.hasOwnProperty('constructor')) {
				oConstructor = oDeclaration['constructor'];
				delete oDeclaration['constructor'];
			}
			oConstructor = makeConstructor(oConstructor, oSuperClass);
			oConstructor.prototype = oPrototype;
			oConstructor.prototype.constructor = oConstructor;
			oConstructor.superclass = oSuperClass;
			
			// prepare static members
			for (var sMember in oDeclaration) if (sMember[0] == '_') {
				oConstructor[sMember.substr(1)] = oDeclaration[sMember];
				delete(oDeclaration[sMember]);
			}
			
			//  Prepare for factory functions in class oDeclaration.
			if (oSuperClass) {
				var fn = (function(){});
				fn.prototype = oSuperClass.prototype.__factories__;
				oPrototype.__factories__ = new fn();
			} else oPrototype.__factories__ = {};
			this.extend(oConstructor, oDeclaration);
			postSubclassNotification(oConstructor);
			return oConstructor;
		},
		
		extend: (function(){
			if ('__defineGetter__' in Object.prototype) return function(klass, decl) {
				var proto = klass.prototype;
				var superproto = klass.superclass && klass.superclass.prototype;
				var v;
				for (var p in decl) {
					var g = decl.__lookupGetter__(p);
					var s = decl.__lookupSetter__(p);
					if (g || s) {
						g && proto.__defineGetter__(p, g);
						s && proto.__defineSetter__(p, s);
					} else addMember(proto, p, decl[p], superproto);
				}
				return klass;
			}; else return function(klass, decl) {
				var proto = klass.prototype;
				var superproto = klass.superclass && klass.superclass.prototype;
				for (var p in decl) addMember(proto, p, decl[p], superproto);
			};
		})()
	};
})();
