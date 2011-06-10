/*
	== Utility functions ==
*/

if ( ! Array.prototype.indexOf ) {
	// Found at: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	Array.prototype.indexOf = function(searchElement) {
		if (this === void 0 || this === null)
			throw new TypeError();
	
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0)
			return -1;
	
		var n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n !== n) // shortcut for verifying if it's NaN
				n = 0;
			else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
			n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	
		if (n >= len)
			return -1;
	
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement)
				return k;
		}
		return -1;
	};
}

/*
	Function:
		now
		
	Returns the current time in milliseconds
*/

function now() {
	return (new Date()).getTime();
}

/*
	Function:
		bind
	
	Bind the <this> variable in a function call
*/

function bind(bound, func) {
	return function() {
		return func.apply(bound, arguments);
	}
}

/*
	Function:
		each
	
	Call a function on an every indice of an array.
*/

function each(arr, func, bindObject) {
	// This is the same function as the native Array.prototype.forEach
	if ( typeof arr.forEach == 'function' )
		return arr.forEach(func, bindObject);
	
	for ( var key in arr ) if ( arr.hasOwnProperty(key) ) 
		func.call(bindObject || window, arr[key], key);
}

/*
	Function:
		addEvent
	
	Add event to given element. Works cross browser, adding multiple events
	is possible.
	
	Taken from: http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
	
	Parameters:
		(element) obj - The element to add events to
		(string) type - The type of event, e.g. "click", "keydown"
		(function) fn - The function to call upon the event
*/

function addEvent( obj, type, fn ) {
	if (obj.addEventListener)
		obj.addEventListener( type, fn, false );
	else if (obj.attachEvent) {
		obj["e"+type+fn] = fn;
		obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
		obj.attachEvent( "on"+type, obj[type+fn] );
	}
}

/*
	Function:
		removeEvent
	
	Remove events added by addEvent.
	
	Parameters:
		(element) obj - The element to remove events from
		(string) type - The type of event, e.g. "click", "keydown"
		(function) fn - The function to remove
*/

function removeEvent( obj, type, fn ) {
	if (obj.removeEventListener)
		obj.removeEventListener( type, fn, false );
	else if (obj.detachEvent) {
		obj.detachEvent( "on"+type, obj[type+fn] );
		obj[type+fn] = null;
		obj["e"+type+fn] = null;
	}
}

/*
	Function:
		elementIsContainedIn
	
	Check if the element1 contains the element2
	
	Parameters:
		(element) element1 - The element to check if it HAS the element2
		(element) element2 - The element to check if it is INSIDE element1
*/

function elementIsContainedIn(element1, element2) {
	if ( element.contains )
		return element1.contains(element2);
	return !!(element1.compareDocumentPosition(element2) & 16);
};

/*
	Function:
		code
	
	Turn a key code into it's corresponding string value.
	
	Parameters:
		(number) name - The keycode
	
	Returns:
		The string value. For up/down/left/right/esc-button it will return that.
		Note that for letters it will be in it's capitalised form
*/

function code(name) {
	var table = {38: 'up', 40: 'down', 37: 'left', 39: 'right', 27: 'esc'};
	if ( table[name] ) return table[name];
	return String.fromCharCode(name);
};

/*
	Function:
		random
	
	Generate a random number in the range ''' from <= x <= to '''.
	
	Parameters:
		(number) from - The starting point
		(number) to - The end point
*/

function random(from, to) {
	return Math.floor(Math.random() * (to + 1) + from);
};

function getRect(element) {
	if ( typeof element.getBoundingClientRect === 'function' ) {
		var rect = element.getBoundingClientRect();
		var sx = window.pageXOffset;
		var sy = window.pageYOffset;
		return {width: rect.width, height: rect.height, left: rect.left + sx, top: rect.top + sy};
	}
	
	var rect = {width: element.offsetWidth, height: element.offsetHeight, left: 0, top: 0};
	var el = element;
	while ( el ) {
		rect.left += el.offsetLeft;
		rect.top += el.offsetTop;
		el = el.offsetParent;
	}
	
	return rect;
};

function getStyle(element, prop) {
	return element.style[prop] || document.defaultView.getComputedStyle(element, null).getPropertyValue(prop);
};
