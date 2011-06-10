/*
	Function:
		Class
	
	Simple function to create MooTools-esque classes
*/
var Class = function(methods) {
	var ret = function() {
		if ( methods && typeof methods.initialize == 'function' )
			return methods.initialize.apply(this, arguments);
	};
	
	for ( var key in methods ) if ( methods.hasOwnProperty(key) )
		ret.prototype[key] = methods[key];
	
	return ret;
};

if ( exports ) exports.Class = Class;