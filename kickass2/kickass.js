/*
	Copyright (c) <2011> <Erik Rothoff Andersson>
	
	This software is provided 'as-is', without any express or implied
	warranty. In no event will the authors be held liable for any damages
	arising from the use of this software.
	
	Permission is granted to anyone to use this software for any purpose,
	including commercial applications, and to alter it and redistribute it
	freely, subject to the following restrictions:
	
	1. The origin of this software must not be misrepresented; you must not
	claim that you wrote the original software. If you use this software
	in a product, an acknowledgment in the product documentation would be
	appreciated but is not required.
	
	2. Altered source versions must be plainly marked as such, and must not be
	misrepresented as being the original software.
	
	3. This notice may not be removed or altered from any source
	distribution.
*/(function(window) {/*
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

var Vector = new Class({
	initialize: function(x, y) {
		if ( typeof x == 'Object' ) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
	},

	cp: function() {
		return new Vector(this.x, this.y);
	},

	mul: function(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	},

	mulNew: function(factor) {
		return new Vector(this.x * factor, this.y * factor);
	},

	add: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	},

	addNew: function(vec) {
		return new Vector(this.x + vec.x, this.y + vec.y);
	},

	sub: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	},

	subNew: function(vec) {
		return new Vector(this.x - vec.x, this.y - vec.y);
	},

	// angle in radians
	rotate: function(angle) {
		var x = this.x, y = this.y;
		this.x = x * Math.cos(angle) - Math.sin(angle) * y;
		this.y = x * Math.sin(angle) + Math.cos(angle) * y;
		return this;
	},

	// angle still in radians
	rotateNew: function(angle) {
		return this.cp().rotate(angle);
	},

	// angle in radians... again
	setAngle: function(angle) {
		var l = this.len();
		this.x = Math.cos(angle) * l;
		this.y = Math.sin(angle) * l;
		return this;
	},

	// RADIANS
	setAngleNew: function(angle) {
		return this.cp().setAngle(angle);
	},

	setLength: function(length) {
		var l = this.len();
		if ( l ) this.mul(length / l);
		else this.x = this.y = length;
		return this;
	},

	setLengthNew: function(length) {
		return this.cp().setLength(length);
	},

	normalize: function() {
		var l = this.len();
		if ( l == 0 )
			return this;
		this.x /= l;
		this.y /= l;
		return this;
	},

	normalizeNew: function() {
		return this.cp().normalize();
	},

	angle: function() {
		return Math.atan2(this.y, this.x);
	},

	collidesWith: function(rect) {
		return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
	},

	len: function() {
		var l = Math.sqrt(this.x * this.x + this.y * this.y);
		if ( l < 0.005 && l > -0.005) return 0;
		return l;
	},

	is: function(test) {
		return typeof test == 'object' && this.x == test.x && this.y == test.y;
	},
	
	dot: function(v2) {
		return this.x * v2.x + this.y * v2.y;
	},

	inTriangle: function(a, b, c) {
		// Compute vectors        
		var v0 = c.subNew(a);
		var v1 = b.subNew(a);
		var v2 = p.subNew(a);
		
		// Compute dot products
		var dot00 = v0.dot(v0);
		var dot01 = v0.dot(v1);
		var dot02 = v0.dot(v2);
		var dot11 = v1.dot(v1);
		var dot12 = v1.dot(v2);
		
		// Compute barycentric coordinates
		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		
		// Check if point is in triangle
		return (u > 0) && (v > 0) && (u + v < 1);
	},

	toString: function() {
		return '[Vector(' + this.x + ', ' + this.y + ') angle: ' + this.angle() + ', length: ' + this.len() + ']';
	}
});/*
	Class:
		Rect
	
	Represents a rectangle at the center of a point. Uses Vector for pos.
*/

var Rect = new Class({
	initialize: function(x, y, w, h) {
		this.pos = new Vector(x, y);
		this.size = {width: w, height: h};
	},
	
	hasPoint: function(point) {
		return point.x > this.pos.x-this.size.width/2 && point.x < this.getRight()
			&& point.y > this.pos.y-this.size.height/2 && point.y < this.getBottom();
	},
	
	getRight: function() {
		return this.pos.x + this.size.width/2;
	},
	
	getBottom: function() {
		return this.pos.y + this.size.height/2;
	}
});
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
/*
	Class:
		KickAss
	
	The main entry point for the game
*/

var KickAss = new Class({
	initialize: function() {
		// Holds all the player instances
		this.players = [];
		
		// Holds an array of elements related to this game
		// this should maybe be replaced with something wiser
		this.elements = [];
		
		// The manager of bullets
		this.bulletManager = new BulletManager();
		this.bulletManager.game = this;
		
		// The manager of enemies
		this.enemyManager = new EnemyManager();
		this.enemyManager.game = this;
		
		// The manager of explosions
		this.explosionManager = new ExplosionManager();
		this.explosionManager.game = this;
		
		// Manager for menus
		this.menuManager = new MenuManager();
		this.menuManager.game = this;
		this.menuManager.create();
		
		// Time of last game loop run
		this.lastUpdate = now();
		
		// A map of keys that are pressed
		this.keyMap = {};
		
		// Bind global events
		this.keydownEvent = bind(this, this.keydown);
		this.keyupEvent = bind(this, this.keyup);
		
		addEvent(document, 'keydown', this.keydownEvent);
		addEvent(document, 'keyup', this.keyupEvent);
		addEvent(document, 'keypress', this.keydownEvent);
		
		// We keep track of scrolling information and window size
		this.scrollPos = new Vector(0, 0);
		this.windowSize = {width: 0, height: 0};
		
		this.updateWindowInfo();
	},
	
	begin: function() {
		// Add first player
		this.addPlayer();
		
		// Begin loop
		this.loopTimer = window.setInterval(bind(this, this.loop), 1000/60);
	},
	
	keydown: function(e) {
		var c = code(e.keyCode);
		this.keyMap[c] = true;
		
		switch ( c) {
			// These events should be stopped
			case 'left':
			case 'right':
			case 'up':
			case 'down':
			case 'esc':
			case ' ':
				if ( e.stopPropogation )
					e.stopPropogation();
				if ( e.preventDefault )
					e.preventDefault();
				e.returnValue = false;
			break;
		}
		
		switch ( c ) {
			case 'esc':
				this.destroy();
				break;
		}
	},
	
	keyup: function(e) {
		var c = code(e.keyCode);
		this.keyMap[c] = false;
		
		switch ( c ) {
			// These events should be stopped
			case 'left':
			case 'right':
			case 'up':
			case 'down':
			case 'esc':
			case ' ':
				if ( e.stopPropogation )
					e.stopPropogation();
				if ( e.preventDefault )
					e.preventDefault();
				e.returnValue = false;
			break;
		}
	},
	
	/*
		Method:
			loop
		
		This is the game loop, subsequently, the most important part of the game.
		Takes care of updating everything, and seeing to that everything is drawn 
		as it should be.
	*/
	
	loop: function() {
		var currentTime = now();
		var tdelta = (currentTime - this.lastUpdate)/1000;
		
		this.updateWindowInfo();
		
		// Update every player
		for ( var i = 0, player; player = this.players[i]; i++ )
			player.update(tdelta);
		
		// Update bullets
		this.bulletManager.update(tdelta);
		
		// Update enemies
		this.enemyManager.update(tdelta);
		
		// Update explosions
		this.explosionManager.update(tdelta);
		
		this.lastUpdate = currentTime;
	},
	
	/*
		Method:
			addPlayer
		
		Adds a player controled by the user. For mega mayhem.
	*/
	
	addPlayer: function() {
		var player = new Player();
		player.game = this;
		
		this.players.push(player);
		
		this.explosionManager.addExplosion(player.pos);
	},
	
	/*
		Method:
			registerElement
		
		Register a DOM-element that belongs to the game
		
		Parameters:
			(element) el - The element to register. It should have the classname "KICKASSELEMENT"
							to avoid confusion
	*/
	
	registerElement: function(el) {
		this.elements.push(el);
	},
	
	/*
		Method:
			unregisterElement
		
		Remove an element registered with <registerElement>
		
		Parameters: See KickAss.registerElement
	*/
	
	unregisterElement: function(el) {
		this.elements.splice(this.elements.indexOf(el), 1);
	},
	
	/*
		Method:
			isKickAssElement
		
		Check if the passed element is child of a registered element.
		
		Parameters:
			(element) el - The element to check
	*/
	
	isKickAssElement: function(el) {
		for ( var i = 0, element; element = this.elements[i]; i++ ) {
			if ( el === element || elementIsContainedIn(element, el) )
				return true;
		}
		return false;
	},
	
	/*
		Method:
			isKeyPressed
		
		Check wether a key is pressed.
		
		Parameters:
			(string) key - The key to be checked if it's pressed
		
		Return:
			bool - True if it's pressed
	*/
	
	isKeyPressed: function(key) {
		return !! this.keyMap[key];
	},
	
	/*
		Method:
			updateWindowInfo
		
		Update information regarding the window, scroll position and size.
	*/
	
	updateWindowInfo: function() {
		var isIEQuirks = (!!window.ActiveXObject) && document.compatMode == "BackCompat";
		
		this.windowSize = {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
		
		if ( isIEQuirks ) {
			this.windowSize.width = document.body.clientWidth;
			this.windowSize.height = document.body.clientHeight;
		}
		
		this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
		this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
	},
	
	/*
		Method:
			hideAll
		
		Hide everything related to Kick ass. This will be everything that has the
		classname "KICKASSELEMENT".
	*/
	
	hideAll: function() {
		for ( var i = 0, el; el = this.elements[i]; i++ )
			el.style.visibility = 'hidden';
	},
	
	/*
		Method:
			showAll
		
		This shows everything hidden by hideAll.
	*/
	
	showAll: function() {
		for ( var i = 0, el; el = this.elements[i]; i++ )
			el.style.visibility = 'visible';
	},
	
	/*
		Method:
			destroy
		
		Remove every trace of Kick Ass.
	*/
	
	destroy: function() {
		// Remove global events
		removeEvent(document, 'keydown', this.keydownEvent);
		removeEvent(document, 'keypress', this.keydownEvent);
		removeEvent(document, 'keyup', this.keyupEvent);
		
		// Destroy everything
		for ( var i = 0, player; player = this.players[i]; i++ )
			player.destroy();
		
		this.bulletManager.destroy();
		this.explosionManager.destroy();
		this.menuManager.destroy();
		
		// Stop game timer
		clearInterval(this.loopTimer);
	}
});
/*
	Class:
		MenuManager
	
	Manages anything that resembles a menu. Points, "Press esc to quit".
*/

var MenuManager = new Class({
	initialize: function() {
		this.numPoints = 0;
	},
	
	create: function() {
		// Container 
		this.container = document.createElement('div');
		this.container.className = 'KICKASSELEMENT';
		
		with ( this.container.style ) {
			position = 'fixed';
			bottom = '20px';
			right = '20px';
			font = '16pt Arial';
			color = 'black';
			zIndex = '1000000';
			textAlign = 'right';
		}
		document.body.appendChild(this.container);
		
		// Points view
		this.points = document.createElement('div');
		this.points.className = 'KICKASSELEMENT';
		this.points.style.fontSize = '30pt';
		this.points.innerHTML = this.numPoints;
		this.container.appendChild(this.points);
		
		// Esc to quit text
		this.escToQuit = document.createElement('div');
		this.escToQuit.className = 'KICKASSELEMENT';
		this.escToQuit.innerHTML = 'Press esc to quit';
		this.container.appendChild(this.escToQuit);
		
		this.fb = document.createElement('div');
		this.fb.innerHTML = '<iframe id="fb-box" src="http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FKick-Ass-Destroy-the-web%2F168200253236727&amp;width=292&amp;colorscheme=light&amp;show_faces=false&amp;stream=false&amp;header=false&amp;height=62" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:350px; height:70px;" allowTransparency="true"></iframe>';
		this.container.appendChild(this.fb);
		
		this.game.registerElement(this.container);
		this.game.registerElement(this.points);
		this.game.registerElement(this.escToQuit);
		this.game.registerElement(this.fb);
	},
	
	/*
		Method:
			addPoints
		
		Add points to the scorecard.
		
		Parameters:
			(int) killed - The number of points killed in 
	*/
	
	addPoints: function(killed) {
		this.numPoints += killed*10;
		this.points.innerHTML = this.numPoints;
	},
	
	destroy: function() {
		this.game.unregisterElement(this.container);
		this.game.unregisterElement(this.escToQuit);
		this.game.unregisterElement(this.points);
		this.game.unregisterElement(this.fb);
		
		this.container.parentNode.removeChild(this.container);
	}
});/*
	Class:
		Player
	
	Keeps track of all the high-level stuff for a player.
	
	Each player is assigned it's own canvas that it's drawn on.
*/

var PLAYERIDS = 0;

var Player = new Class({
	initialize: function() {
		this.id = PLAYERIDS++;
		
		// Vertices for the player
		// Remember that the ship should be pointing to the left
		this.verts = [
			[-10, 10],
			[15, 0],
			[-10, -10],
			[-10, 10]
		];
		
		this.size = {width: 20, height: 30};
		
		// Flame vertices
		this.flames = {r: [], y: []};
		
		// The canvas for the ship, leave some room for the flames 
		this.sheet = new Sheet(new Rect(100, 100, 50, 50));
		
		// Physics
		this.pos = new Vector(100, 100);
		this.vel = new Vector(0, 0);
		this.acc = new Vector(0, 0);
		this.dir = new Vector(1, 0);
		this.currentRotation = 0;
		
		this.isBroken = false;
		this.lineOffsets = [];
		this.deadTime = 0;
		
		// Physics-related constants
		this.friction = 0.8;
		this.terminalVelocity = 2000;
		
		this.lastPos = new Vector(0, 0);
		this.lastFrameUpdate = 0;
		
		this.generateFlames();
	},
	
	update: function(tdelta) {
		if ( this.isBroken ) {
			if ( ! this.lineOffsets.length ) {
				for ( var i = 0; i < (this.verts.length-1); i++ )
					this.lineOffsets[i] = {pos: new Vector(0, 0), dir: (new Vector(1, 1)).setAngle(Math.PI*2*Math.random())};
			}
			
			for ( var i = 0; i < this.lineOffsets.length; i++ ) {
				this.lineOffsets[i].pos.add(this.lineOffsets[i].dir.cp().setLength(50).mul(tdelta));
			}
			
			this.sheet.clear();
			this.sheet.setAngle(this.dir.angle());
			this.sheet.setPosition(this.pos);
			
			this.sheet.drawBrokenPlayer(this.verts, this.lineOffsets);
			
			if ( now() - this.deadTime > 1000.0 ) {
				this.isBroken = false;
				this.lineOffsets = [];
				this.randomPos();
			}
			
			return;
		}
		
		// Rotation
		if ( this.game.isKeyPressed('left') || this.game.isKeyPressed('right') ) {
			if ( this.game.isKeyPressed('left') )
				this.rotateLeft();
			if ( this.game.isKeyPressed('right') )
				this.rotateRight();
		} else {
			this.stopRotate();
		}
		
		// Activate thrusters!
		if ( this.game.isKeyPressed('up') )
			this.activateThrusters();
		else
			this.stopThrusters();
		
		// Add rotation
		if ( this.currentRotation )
			this.dir.setAngle(this.dir.angle() + this.currentRotation*tdelta);
		
		// Add acceleration to velocity
		// The equation for the friction is:
		//      velocity += acceleration - friction*velocity
		// Found at: http://stackoverflow.com/questions/667034/simple-physics-based-movement
		var frictionedAcc = this.acc.mulNew(tdelta).sub(this.vel.mulNew(tdelta*this.friction))
		this.vel.add(frictionedAcc);
		
		// Cap velocity
		if ( this.vel.len() > this.terminalVelocity )
			this.vel.setLength(this.terminalVelocity);
		
		// Add velocity to position
		this.pos.add(this.vel.mulNew(tdelta));
		
		// Update flames?
		if ( now() - this.lastFrameUpdate > 1000/15 )
			this.generateFlames();
		
		// Check bounds and update accordingly
		this.checkBounds();
		
		// Only update canvas if any changes have occured
		if ( ! this.lastPos.is(this.pos) || this.currentRotation ) {
			// Draw changes onto canvas
			this.sheet.clear();
			this.sheet.setAngle(this.dir.angle());
			this.sheet.setPosition(this.pos);
			
			// Draw flames if thrusters are activated
			if ( ! this.acc.is({x: 0, y: 0}) ) {
				this.sheet.drawFlames(this.flames);
			}
			
			this.sheet.drawPlayer(this.verts);
			
			this.lastPos = this.pos.cp();
		}
	},
	
	randomPos: function() {
		var w = this.game.windowSize.width;
		var h = this.game.windowSize.height;
		
		this.pos = new Vector(random(0, w), random(0, h));
	},
	
	/*
		Method:
			generateFlames
		
		Update flames every 0.2 seconds or something. Generates new flame
		polygons for red/yellow
	*/
	
	generateFlames: function() {
		var rWidth = this.size.width,
			rIncrease = this.size.width * 0.1,
			yWidth = this.size.width * 0.6,
			yIncrease = yWidth * 0.2,
			halfR = rWidth / 2,
			halfY = yWidth / 2,
			halfPlayerHeight = this.size.height / 4;
			
		// Firstly recreate the flame vertice arrays
		this.flames.r = [[-1 * halfPlayerHeight, -1 * halfR]];
		this.flames.y = [[-1 * halfPlayerHeight, -1 * halfY]];

		for ( var x = 0; x < rWidth; x += rIncrease )
			this.flames.r.push([-random(2, 7) - halfPlayerHeight, x - halfR]);

		this.flames.r.push([-1 * halfPlayerHeight, halfR]);
		
		// And the yellow flames
		for ( var x = 0; x < yWidth; x += yIncrease )
			this.flames.y.push([-random(2, 7) - halfPlayerHeight, x - halfY]);

		this.flames.y.push([-1 * halfPlayerHeight, halfY]);
	
		this.lastFrameUpdate = now();
	},
	
	/*
		Method:
			checkBounds
		
		Update the bounds so we don't encounter any strange scrollbars.
		Scroll ship if it's out of bounds, or just move it to the other side
	*/
	
	checkBounds: function() {
		var w = this.game.windowSize.width;
		var h = this.game.windowSize.height;
		
		// Because the sheet is larger than the ship itself setting it
		// to the right most position can cause a scrollbar to appear
		// therefor the right bound is the x-position, including half the sheet width
		var rightBound = this.pos.x + this.sheet.rect.size.width/2;
		var bottomBound = this.pos.y + this.sheet.rect.size.height/2;
		
		// Check bounds X
		if ( rightBound > w ) {
			window.scrollTo(this.game.scrollPos.x + 50, this.game.scrollPos.y);
			this.pos.x = 0;
		} else if ( this.pos.x < 0 ) {
			window.scrollTo(this.game.scrollPos.x - 50, this.game.scrollPos.y);
			this.pos.x = w - this.sheet.rect.size.width/2;
		}
		
		// check bounds Y
		if ( bottomBound > h ) {
			window.scrollTo(this.game.scrollPos.x, this.game.scrollPos.y + h * 0.75);
			this.pos.y = 0;
		} else if ( this.pos.y < 0 ) {
			window.scrollTo(this.game.scrollPos.x, this.game.scrollPos.y - h * 0.75);
			this.pos.y = h - this.sheet.rect.size.height/2;
		}
	},
	
	inRect: function(rect) {
		var ret = false;
		
		for ( var i = 0, vert; vert = this.verts[i]; i++ ) {
			if ( rect.hasPoint(new Vector(vert[0] + this.pos.x, vert[1] + this.pos.y)) )
				ret = true;
		}
		return ret;
	},
	
	hit: function(by) {
		if ( this.isBroken ) return;
		this.isBroken = true;
		//this.game.explosionManager.addExplosion(this.pos);
		this.deadTime = now();
	},
	
	// Activate and deactivate thrusters, thus accelerating the ship
	activateThrusters: function() {
		this.acc = (new Vector(500, 0)).setAngle(this.dir.angle());
	},
	
	stopThrusters: function() {
		this.acc = new Vector(0, 0);
	},
	
	// Rotate left/right/stop rotation methods
	rotateLeft: function() {
		this.currentRotation = -Math.PI*2;
	},
	
	rotateRight: function() {
		this.currentRotation = Math.PI*2;
	},
	
	stopRotate: function() {
		this.currentRotation = 0;	
	},
	
	destroy: function() {
		this.sheet.destroy();
	}
});/*
	Class:
		BulletManager
	
	Keeps track of all the bullets, collision detection, bullet life time
	and those things.
*/

var BulletManager = new Class({
	initialize: function() {
		this.bullets = {};
		this.lastFired = 0;
		
		this.lastBlink = 0;
		this.blinkActive = false;
		this.enemyIndex = [];
	},
	
	update: function(tdelta) {
		// If spacebar is pressed down, and only shoot every 0.1 second
		if ( this.game.isKeyPressed(' ') && now() - this.lastFired > 100 ) {
			for ( var i = 0, player; player = this.game.players[i]; i++ )
				if ( ! player.isBroken )
					this.addBulletFromPlayer(player);
			this.lastFired = now();
		}
		
		// If B is pressed, show remaining enemies
		if ( this.game.isKeyPressed('B') ) {
			this.blink();
		} else {
			this.endBlink();
		}
		
		for ( var key in this.bullets ) if ( this.bullets.hasOwnProperty(key) ) {
			var time = now(); // the time... is now
			
			// Remove bullets older than 2 seconds
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ ) {
				if ( time - bullet.bornAt > 2000 ) {
					bullet.destroy();
					this.bullets[key].splice(i, 1);
				}
			}
		
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ ) {
				bullet.update(tdelta);
				
				// Hide everything related to this game so it can't be hit
				this.game.hideAll();
				
				var hit = bullet.checkCollision();
				
				// If we hit something remove the element, add an explosion and remove the bullet
				if ( hit ) {
					if ( this.game.enemyManager.enemies.length <= 10 ) {
						this.game.explosionManager.addExplosion(bullet.pos);
						this.game.menuManager.addPoints(hit.getElementsByTagName('*').length + 1);
					
						if ( ! hit.isShot ) {
							this.game.enemyManager.addEnemyFromElement(hit);
						} else {
							this.game.enemyManager.shotEnemy(hit);
						}
					
						bullet.destroy();
						this.bullets[key].splice(i, 1);
					} else {
						if ( hit.isShot ) {
							this.game.explosionManager.addExplosion(bullet.pos);
							this.game.enemyManager.shotEnemy(hit);
							
							bullet.destroy();
							this.bullets[key].splice(i, 1);
						}
					}
				}
				
				// Show it again
				this.game.showAll();
			}
		}
	},
	
	/*
		Method:
			blink
		
		Shows a red border around all remaining enemies every 0.25 seconds
	*/
	
	blink: function() {
		if ( now() - this.lastBlink > 250 ) {
			for ( var i = 0, el; el = this.enemyIndex[i]; i++ ) {
				if ( ! this.blinkActive )
					el.style.outline = '1px solid red';
				else
					el.style.outline = el.KICKASSOLDBORDER;
			}					
			this.blinkActive = ! this.blinkActive;
			this.lastBlink = now();
			
			if ( ! this.blinkActive ) {
				this.updateEnemyIndex();
			}
		}
	},
	
	/*
		Method:
			endBlink
		
		End any blinking action (if there is any)
	*/
	
	endBlink: function() {
		// endBlink is called every run loop if B isn't pressed, so only
		// reset everything if there is something to reset
		if ( this.enemyIndex.length ) {
			for ( var i = 0, el; el = this.enemyIndex[i]; i++ )
				el.style.outline = el.KICKASSOLDBORDER;
			
			this.enemyIndex = [];
			this.lastBlink = 0;
			this.blinkActive = false;
		}
	},
	
	/*
		Method:
			updateEnemyIndex
		
		Update index of destroyable enemies
	*/
	
	updateEnemyIndex: function() {
		var all = document.getElementsByTagName('*');
		this.enemyIndex = [];
		
		for ( var i = 0, el; el = all[i]; i++ ) {
			if ( this.hasOnlyTextualChildren(el) ) {
				this.enemyIndex.push(el);
				
				el.KICKASSOLDBORDER = el.style.outline || (document.defaultView.getComputedStyle(el, null).outline);
			}
		}
	},
	
	/*
		Method:
			addBulletFromPlayer
		
		Add bullet at the position of a player's cannon
	*/
	
	addBulletFromPlayer: function(player) {
		var pid = player.id;
		
		// If the player has more than 10 bullets, remove the oldest one
		if (this.bullets[pid] && this.bullets[pid].length > 10 ) {
			this.bullets[pid][0].destroy();
			this.bullets[pid].shift();
		}
		
		var bullet = new Bullet();
		bullet.manager = this;
		bullet.pos = player.pos.cp();
		bullet.dir = player.dir.cp();
		bullet.game = this.game;
		
		// Make sure the bullet is traveling faster than the player
		bullet.vel.add(bullet.vel.cp().setLength(player.vel.len()));
		
		// Bullets are stored per ship, ensure we have an array for this ship
		if ( ! this.bullets[pid] )
			this.bullets[pid] = [];
		
		this.bullets[pid].push(bullet);	
	},
	
	/*
		Method:
			hasOnlyTextualChildren
		
		Find out if an element is suitable for destruction by checking if it
		only has "textual" children. It wouldn't be too fun a game if you could
		simply destroy the wrapper-div of a page on your first shot, right?
	*/
	
	hasOnlyTextualChildren: function(element) {
		if ( element == document.defaultView || element == document.body)
			return false;
		
		if ( element.className && element.className.indexOf('KICKASSELEMENT') != -1 )
			return false;
		
		for ( var i = 0; i < element.childNodes.length; i++ ) {
			if (element.childNodes[i].childNodes[0]) {
				var children = element.childNodes;
				for ( var i = 0, child; child = children[i]; i++ ) {
					if ( child.nodeType != 1 || child.style.visibility == 'hidden' || child.style.display == 'none' )
						continue;
					
					if ( child.offsetHeight == 0 || child.offsetWidth == 0 )
						continue;
					
					if ( ELEMENTSTHATCOUNTASTEXTUAL.indexOf(child.tagName) == -1 && ELEMENTSTHATARENOTTOBEINCLUDED.indexOf(child.tagName) == -1 )
						return false;
				}
			}
		}
		return true;
	},
	
	destroy: function() {
		for ( var key in this.bullets ) if ( this.bullets.hasOwnProperty(key) ) 
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ )
				bullet.destroy();
		this.bullets = {};
	}
});

var ELEMENTSTHATCOUNTASTEXTUAL = ['BR', 'SELECT', 'LEGEND'];
var ELEMENTSTHATARENOTTOBEINCLUDED = ['BR', 'SCRIPT', 'STYLE', 'TITLE', 'META', 'HEAD', 'OPTION', 'OPTGROUP'];
	
/*
	Class:
		Bullet
	
	Represents a bullet, and takes care of high-level bullet management.
	Does not take care of collision detection. That's the BulletManager's
	job.
*/

var Bullet = new Class({
	initialize: function() {
		this.pos = new Vector(100, 100);
		this.dir = new Vector(1, 1);
		this.vel = new Vector(500, 500);
		
		this.bornAt = now();
		
		this.sheet = new Sheet(new Rect(this.pos.x, this.pos.y, 5, 5));
		this.sheet.drawBullet();
	},
	
	update: function(tdelta) {
		this.pos.add(this.vel.setAngle(this.dir.angle()).mulNew(tdelta));
		
		this.checkBounds();
		this.sheet.setPosition(this.pos);
	},
	
	/*
		Method:
			checkCollision
		
		Get the element the bullet is currently over.
		
		Returns:
			The element that the bullet is on, or false.
	*/
	
	checkCollision: function() {
		var element = document.elementFromPoint(this.pos.x, this.pos.y);
		if ( element && element.nodeType == 3 )
			element = element.parentNode;
		return element && element != document.documentElement && this.manager.hasOnlyTextualChildren(element) ? element : false;
	},
			
	// See: <Player.checkBounds>
	checkBounds: function() {
		var w = this.game.windowSize.width;
		var h = this.game.windowSize.height;
		
		var rightBound = this.pos.x + this.sheet.rect.size.width/2;
		var bottomBound = this.pos.y + this.sheet.rect.size.height/2;
		
		// Check bounds X
		if ( rightBound > w )
			this.pos.x = 0;
		else if ( this.pos.x < 0 )
			this.pos.x = w - this.sheet.rect.size.width/2;
		
		// Check bounds Y
		if ( bottomBound > h )
			this.pos.y = 0;
		else if ( this.pos.y < 0 )
			this.pos.y = h - this.sheet.rect.size.height/2;
	},
	
	destroy: function() {
		this.sheet.destroy();
	}
});
/*
	Class:
		EnemyManager
	
	Take care of enemies.
*/
var ENEMYEID = 0;

var EnemyManager = new Class({
	initialize: function() {
		this.enemies = [];
		this.enemyMap = {};
	},
	
	update: function(tdelta) {
		for ( var i = 0, enemy; enemy = this.enemies[i]; i++ ) {
			// remove enemies proclaimed as dead
			if ( enemy.isDead ) {
				delete this.enemyMap[enemy.element.ENEMYEID];
				enemy.destroy();
				this.enemies.splice(i, 1);
				continue;
			}
			
			enemy.update(tdelta);
			
			// Check collisions
			if ( enemy.isActive ) {
				for ( var j = 0, player; player = this.game.players[j]; j++ ) {
					var rect = enemy.getRect();
					rect.pos.sub(this.game.scrollPos);
					if ( player.inRect(rect) ) {
						player.hit(enemy);
					}
				}
			}
		}
	},
	
	addEnemyFromElement: function(element) {
		if ( random(0, 10) < 5 )
			return;
		
		element.ENEMYEID = ENEMYEID++;
		
		var enemy = new Enemy(element);
		enemy.game = this.game;
		
		this.enemies.push(enemy);
		this.enemyMap[element.ENEMYEID] = enemy;
	},
	
	shotEnemy: function(element) {
		var enemy = this.enemyMap[element.ENEMYEID];
		if ( ! enemy ) return;
		
		enemy.wasShot();
	}
});

/*
	Class:
		Enemy
*/


ENEMYFACELEMENT = new Image();
ENEMYFACELEMENT.src = 'http://i.imgur.com/ZtyvZ.png';

var Enemy = new Class({
	initialize: function(element) {
		this.element = element;
		this.pos = new Vector(0, 0);
		this.vel = (new Vector(75, 75)).mul(Math.sin(Math.PI*2*Math.random()));
		
		this.lives = getStyle(element, 'opacity');
		this.isDead = false;
		this.isAI = random(0, 7) == 3;
		
		var offset = getRect(element);
		
		element.style.width = offset.width + 'px';
		element.style.height = offset.height + 'px';
		
		document.body.appendChild(element);
		
		if ( offset.width < 10 ) {
			offset.width = 50;
			element.style.width = offset.width + 'px';
		}
		if ( offset.height < 10 ) {
			offset.height = 50;
			element.style.height = offset.height + 'px';
		}
		
		this.rect = new Rect(offset.left, offset.top, offset.width, offset.height);
		this.pos = this.rect.pos.cp();
		
		// Mark it as in zombie-mode
		this.element.isShot = true;
		
		// Prepare element for moving	
		element.style.position = 'absolute';
		element.style.left = this.rect.pos.x + 'px';
		element.style.top = this.rect.pos.y + 'px';
		element.style.margin = '0';
		element.style.outline = '1px dotted black';
		element.style.zIndex = '10000';
		this.rect.size = {width: offset.width, height: offset.height};
		
		this.isActive = false;
		this.blinkTheta = 0;
		
		if ( this.isAI )
			this.prepareFace();
	},
	
	prepareFace: function() {
		this.face = new Sheet(new Rect(this.rect.pos.x+this.rect.size.width/2, this.rect.pos.y+this.rect.size.height/2, this.rect.size.width, this.rect.size.height));
		this.face.drawFace(ENEMYFACELEMENT);
	},
	
	wasShot: function() {
		this.lives -= 0.20;
		
		if ( this.lives <= 0.25 ) {
			// dead
			this.isDead = true;
			return;
		}
		
		this.element.style.opacity = this.lives;
	},
	
	update: function(tdelta) {
		if ( this.isDead ) {
			return;
		}
		
		this.pos.add(this.vel.mulNew(tdelta));
		
		if ( this.isAI ) {
			this.face.setPosition(this.pos.cp().add(new Vector(this.rect.size.width/2, this.rect.size.height/2)));
		}
		
		if ( ! this.isActive ) {
			this.blinkTheta += tdelta;
			this.element.style.opacity = Math.cos(this.blinkTheta*10) * 0.25 + 0.75;
			if ( this.blinkTheta > 2.0 && this.element.style.opacity > 0.98 ) {
				this.isActive = true;
				this.element.style.opacity = 1.0;
			}
		}
		
		this.checkBounds();
		
		this.element.style.left = this.pos.x + 'px';
		this.element.style.top = this.pos.y + 'px';
	},
	
	checkBounds: function() {
		// Check bounds by checking if the real position plus pos (which is position delta)
		// is outside the viewport bounds
		var realPos = this.pos.cp();
		var vSize = this.game.windowSize;
		var vPos = this.game.scrollPos;
		
		// Out of bounds to:
		// 	left
		if ( realPos.x+this.rect.size.width/2 < vPos.x ) {
			this.pos.x += vSize.width - this.rect.size.width/2;
		// 	right
		} else if ( realPos.x + this.rect.size.width > vPos.x + vSize.width ) {
			this.pos.x -= vSize.width - this.rect.size.width;
		}
		
		// top
		if ( realPos.y+this.rect.size.height/2 < vPos.y ) {
			this.pos.y += vSize.height - this.rect.size.height/2;
		// bottom
		} else if ( realPos.y + this.rect.size.height > vPos.y + vSize.height ) {
			this.pos.y -= vSize.height - this.rect.size.height;
		}
	},
	
	getRect: function() {
		var realPos = this.pos.cp();
		return new Rect(realPos.x+this.rect.size.width/2, realPos.y+this.rect.size.height/2, this.rect.size.width, this.rect.size.height);
	},
	
	destroy: function() {
		this.element.parentNode.removeChild(this.element);
		if ( this.face )
			this.face.destroy();
	}
});
/*
	Class:
		ExplosionManager
	
	Manager for explosions. 
*/

var ExplosionManager = new Class({
	initialize: function() {
		this.explosions = [];
	},
	
	update: function(tdelta) {
		var time = now();
		
		for ( var i = 0, explosion; explosion = this.explosions[i]; i++ ) {
			// Remove explosions older than 0.3 seconds
			if ( time - explosion.bornAt > 300 ) {
				explosion.destroy();
				this.explosions.splice(i, 1);
				continue;
			}
			
			// Update it
			explosion.update(tdelta);
		}
	},
	
	/*
		Method:
			addExplosion
		
		Add explosion at the center of a point.
		
		Parameters:
			(Vector) pos - The position of the explosion
	*/
	
	addExplosion: function(pos) {
		var explosion = new Explosion(pos);
		explosion.game = this.game;
		explosion.checkBounds();
		
		this.explosions.push(explosion);
	},
	
	destroy: function() {
		for ( var i = 0, explosion; explosion = this.explosions[i]; i++ )
			explosion.destroy();
		this.explosions = [];
	}
});
/*
	Class:
		Explosion
	
	Class that represents an explosion. The drawing, lifetime, etc
*/

var Explosion = new Class({
	initialize: function(pos) {
		this.bornAt = now();
		this.pos = pos.cp();
		this.particleVel = new Vector(200, 0);
		
		this.generateParticles();
		
		this.sheet = new Sheet(new Rect(pos.x, pos.y, 250, 250));
	},
	
	update: function(tdelta) {
		var vel = this.particleVel.mulNew(tdelta);
		this.particleVel.mul(0.95*tdelta);
		
		for ( var i = 0, particle; particle = this.particles[i]; i++ )
			particle.pos.add( particle.vel.mulNew(tdelta).mul(random(0.5, 1.0)).setAngle(particle.dir.angle()) );
		
		this.sheet.clear();
		this.sheet.drawExplosion(this.particles);
	},
	
	/*
		Method:
			generateParticles
		
		Generate around 30 particles that fly in a random direction
	*/
	
	generateParticles: function() {
		this.particles = [];
		
		// Generate 
		for ( var i = 0, j = (typeof Raphael != 'undefined') ? 10 : 40; i < j; i++ ) {
			this.particles.push({
				dir: (new Vector(random(0, 20)-10, random(0, 20)-10)).normalize(),
				vel: this.particleVel.cp(),
				pos: new Vector(0, 0)
			});
		}
	},
	
	/*
		Method:
			checkBounds
		
		This is just a quick test to see if the sheet is outside of the window
		if it is, we just adjust it so it doesn't cause any scrollbars.
	*/
	
	checkBounds: function() {
		// Just do a quick bounds check on the sheet
		var right = this.sheet.rect.getRight();
		var bottom = this.sheet.rect.getBottom();
		
		var w = this.game.windowSize.width;
		var h = this.game.windowSize.height;
		
		if ( right > w )
			this.pos.x -= right - w;
		if ( bottom > h )
			this.pos.y -= bottom - h;
		
		this.sheet.setPosition(this.pos);
	},
	
	destroy: function() {
		this.sheet.destroy();
	}
});
/*
	Class:
		Sheet
	
	Abstraction for choosing between Raphael or canvas when drawing things.
*/

var Sheet = new Class({
	initialize: function(rect) {
		this.rect = rect;
		
		if ( typeof Raphael != 'undefined' )
			this.drawer = new SheetRaphael(rect);
		else
			this.drawer = new SheetCanvas(rect);
	},
	
	/*
		Method:
			clear
		Clear the sheet to a initial blank state
	*/
	
	clear: function() {
		this.drawer.clear();
	},
	
	/*
		Method:
			setPosition
	*/
	
	setPosition: function(pos) {
		this.rect.pos = pos.cp();
		this.drawer.rect = this.rect;
		this.drawer.updateCanvas();
	},
	
	
	/*
		Method:
			setAngle
		Set the angle used when drawing things
	*/
	
	setAngle: function(angle) {
		this.drawer.setAngle(angle);
	},
	
	/*
		Method:
			drawPlayer
		
		Specialised method for drawing the player. Takes the verts
		and draws it with a black border around a white body
	*/
	
	drawPlayer: function(verts) {
		this.drawer.setFillColor('white');
		this.drawer.setStrokeColor('black');
		this.drawer.setLineWidth(1.5);
		
		this.drawer.tracePoly(verts);
		this.drawer.fillPath();
		
		this.drawer.tracePoly(verts);
		this.drawer.strokePath();
	},
	
	drawBrokenPlayer: function(verts, lineOffsets) {
		this.drawer.setStrokeColor('black');
		this.drawer.setLineWidth(1.5);
		
		for ( var i = 1, vert, lastVert = verts[0]; vert = verts[i]; i++, lastVert = vert ) {
			var o = lineOffsets[i-1];
			this.drawer.drawLine(lastVert[0]+o.pos.x, lastVert[1]+o.pos.y, vert[0]+o.pos.x, vert[1]+o.pos.y);
		}
	},
	
	/*
		Method:
			drawFlames
		
		Specialised method for drawing flames.
		
		Parameters:
			(object) flames - An object with an r- and y-property, 
								containing arrays of vertices
	*/
	
	drawFlames: function(flames) {
		this.drawer.setStrokeColor('red');
		this.drawer.tracePoly(flames.r);
		this.drawer.strokePath();
		
		this.drawer.setStrokeColor('yellow');
		this.drawer.tracePoly(flames.y);
		this.drawer.strokePath();
	},
	
	/*
		Method:
			drawBullet
		
		Specialised method for drawing a bullet. It's basically just a circle.
	*/
	
	drawBullet: function() {
		this.drawer.setFillColor('black');
		this.drawer.drawCircle(2.5);
	},
	
	/*
		Method:
			drawExplosion
		
		Specialised method for drawing explosions.
		
		Parameters:
			(array) particles - An array of particles. These particles are actually
									objects with a pos-property (among other things)
	*/
	
	drawExplosion: function(particles) {
		for ( var i = 0, particle; particle = particles[i]; i++ ) {
			// Set a random particle color
			this.drawer.setFillColor(['yellow', 'red'][random(0, 1)]);
			this.drawer.drawRect(particle.pos.x, particle.pos.y, 3, 3);
//				this.drawer.drawLine(particle.pos.x, particle.pos.y, particle.pos.x - particle.dir.x * 10, particle.pos.y - particle.dir.y * 10);
		}
	},
	
	/*
		Method:
			drawFace
		
		Draw the face. Will stretch the face to the entire rect.
		
		Parameters:
			(element) face - The <img />-element with the face
	*/
	
	drawFace: function(face) {
		this.drawer.drawImageFull(face);
	},
	
	destroy: function() {
		this.drawer.destroy();
	}
});
/*
	Class:
		SheetRaphael
	
	Abstracts a lot of the drawing to Raphael SVG
*/

var SheetRaphael = new Class({
	initialize: function(rect) {
		this.rect = rect;
		
		this.fillColor = 'black';
		this.strokeColor = 'black';
		this.lineWidth = 1.0;
		this.polyString = '';
		
		this.raphael = Raphael(this.rect.pos.x-this.rect.size.width/2, this.rect.pos.y-this.rect.size.height/2, this.rect.size.width, this.rect.size.height);
		this.raphael.canvas.style.zIndex = '10000';
		this.raphael.canvas.className = 'KICKASSELEMENT';
		
		// -- bad style?
		window.KICKASSGAME.registerElement(this.raphael.canvas);
		// --
	},
	
	// See: <SheetCanvas>
	tracePoly: function(verts) {
		// Nothing to draw
		if ( ! verts[0] ) return;
		
		this.polyString = 'M' + verts[0][0] + ' ' + verts[0][1];
		for ( var i = 0; i < verts.length; i++ )
			this.polyString += 'L' + verts[i][0] + ' ' + verts[i][1];
	},
	
	// See: <SheetCanvas>
	setAngle: function(angle) {
		this.angle = angle;
	},
	
	// See: <SheetCanvas>
	updateCanvas: function() {
		this.raphael.canvas.width = this.rect.size.width;
		this.raphael.canvas.height = this.rect.size.height;
		
		this.raphael.canvas.style.left = window.KICKASSGAME.scrollPos.x + (this.rect.pos.x - this.rect.size.width/2) + 'px';
		this.raphael.canvas.style.top = window.KICKASSGAME.scrollPos.y + (this.rect.pos.y - this.rect.size.height/2) + 'px';
	},
	
	// See: <SheetCanvas>
	drawLine: function(xFrom, yFrom, xTo, yTo) {
		this.tracePoly([[xFrom, yFrom], [xTo, yTo]]);
		this.strokePath();
	},
	
	// See: <SheetCanvas>
	drawCircle: function(radius, pos) {
		pos = pos || {x: 0, y: 0};
		this.currentElement = this.raphael.circle(pos.x, pos.y, radius);
		this.currentElement.attr('fill', this.fillColor);
	},
	
	// See: <SheetCanvas>
	setFillColor: function(color) {
		this.fillColor = color;
	},
	
	// See: <SheetCanvas>
	setStrokeColor: function(color) {
		this.strokeColor = color;
	},
	
	// See: <SheetCanvas>
	setLineWidth: function(width) {
		this.lineWidth = width;
	},
	
	// See: <SheetCanvas>
	fillPath: function() {
		this.currentElement = this.raphael.path(this.polyString);
		this.currentElement.translate(this.rect.size.width/2, this.rect.size.height/2);
		this.currentElement.attr('fill', this.fillColor);
		this.currentElement.attr('stroke', this.fillColor);
		this.currentElement.rotate(Raphael.deg(this.angle), this.rect.size.width/2, this.rect.size.height/2);
	},
	
	// See: <SheetCanvas>
	strokePath: function() {
		this.currentElement = this.raphael.path(this.polyString);
		this.currentElement.attr('stroke', this.strokeColor);
		this.currentElement.attr('stroke-width', this.lineWidth);
		this.currentElement.translate(this.rect.size.width/2, this.rect.size.height/2);
		this.currentElement.rotate(Raphael.deg(this.angle), this.rect.size.width/2, this.rect.size.height/2);
	},
	
	// See: <SheetCanvas>
	clear: function() {
		this.raphael.clear();
	},
	
	destroy: function()  {
		// -- Bad style?
		window.KICKASSGAME.unregisterElement(this.raphael.canvas);
		// --
		
		this.raphael.remove();
	}
});
/*
	Class:
		SheetCanvas
	
	Abstracts a lot of the canvas drawing into a "sheet". 
*/

var SheetCanvas = new Class({
	/*
		Constructor
		
		Parameters:
			(Rect) rect - The size and position of the element. The position is the element's center 
	*/
	
	initialize: function(rect) {
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'KICKASSELEMENT';
		with ( this.canvas.style ) {
			position = 'absolute';
			zIndex = '1000000';
		}
		
		// -- Bad style?
		window.KICKASSGAME.registerElement(this.canvas);
		// --
		
		if ( this.canvas.getContext )
			this.ctx = this.canvas.getContext('2d');
		
		this.rect = rect;
		this.angle = 0;
		
		this.updateCanvas();
		(document.body).appendChild(this.canvas);
	},
	
	/*
		Method:
			tracePoly
		
		Add points that will be drawn with <fillPath> or <strokePath>
	*/
	
	tracePoly: function(verts) {
		// Nothing to draw
		if ( ! verts[0] ) return;
		
		// Move to center of canvas and rotate the coordinate system
		this.ctx.save();
		this.ctx.translate(this.rect.size.width/2, this.rect.size.height/2);
		this.ctx.rotate(this.angle);
		
		// Trace every vertice
		this.ctx.beginPath();
		this.ctx.moveTo(verts[0][0], verts[0][1]);
		for ( var i = 0; i < verts.length; i++ )
			this.ctx.lineTo(verts[i][0], verts[i][1]);
		
		this.ctx.restore();
	},
	
	/*
		Method:
			setAngle
		Set the angle used when drawing things
	*/
	
	setAngle: function(angle) {
		this.angle = angle;
	},
	
	/*
		Method:
			updateCanvas
		
		Update the position and size of the current canvas element
	*/
	
	updateCanvas: function() {
		if ( this.canvas.width != this.rect.size.width )
			this.canvas.width = this.rect.size.width;
		if ( this.canvas.height != this.rect.size.height )
			this.canvas.height = this.rect.size.height;
		
		this.canvas.style.left = window.KICKASSGAME.scrollPos.x + (this.rect.pos.x - this.rect.size.width/2) + 'px';
		this.canvas.style.top = window.KICKASSGAME.scrollPos.y + (this.rect.pos.y - this.rect.size.height/2) + 'px';
	},
	
	/*
		Method:
			drawLine
		
		Draw a not-so-liney line.
		
		Parameters:
			(number) xFrom - The x starting coordinate
			(number) yFrom - The y starting coordinate
			(number) xTo - The x end coordinate
			(number) yTo - The y end coordinate
	*/
	
	drawLine: function(xFrom, yFrom, xTo, yTo) {
		this.ctx.save();
		this.ctx.translate(this.rect.size.width/2, this.rect.size.height/2);
		
		this.ctx.beginPath();
		this.ctx.moveTo(xFrom, yFrom);
		this.ctx.lineTo(xTo, yTo);
		this.ctx.closePath();
		this.ctx.stroke();
		
		this.ctx.restore();
	},
	
	/*
		Method:
			drawCircle
		
		Draw circle at the center (or at a given point) of the sheet with a given radius
		
		Parameters:
			(number) radius - The radius of the circle
			(Vector, optional) pos - The position of the circle. Defaults to center
	*/
	
	drawCircle: function(radius, pos) {
		pos = pos || {x: 0, y: 0};
		
		this.ctx.save();
		this.ctx.translate(this.rect.size.width/2, this.rect.size.height/2);
		if ( pos )
			this.ctx.translate(pos.x, pos.y);
		this.ctx.arc(0, 0, radius, 0, Math.PI*2, true);
		this.ctx.restore();
		this.ctx.fill();
	},
	
	drawRect: function(x, y, w, h) {
		this.ctx.save();
		this.ctx.translate(this.rect.size.width/2, this.rect.size.height/2);
		this.ctx.translate(x, y);
		this.ctx.fillRect(x, y, w, h);
		this.ctx.restore();
		this.ctx.fill();
	},
	
	/*
		Method:
			drawImageFull
		
		Draw an image at the full size of the canvas.
		
		Parameters:
			(element) image - The image to draw
	*/
	
	drawImageFull: function(image) {
		this.ctx.drawImage(image, 0, 0, this.rect.size.width, this.rect.size.height);
	},
	
	/*
		Method:
			setFillColor
		Set the color used when filling with <fillPath>
	*/
	
	setFillColor: function(color) {
		this.ctx.fillStyle = color;
	},
	
	/*
		Method:
			setStrokeColor
		Set the border color for when using <strokePath>
	*/
	
	setStrokeColor: function(color) {
		this.ctx.strokeStyle = color;
	},
	
	/*
		Method:
			setLineWidth
		Set the line width of the border when using <strokePath>
	*/
	
	setLineWidth: function(width) {
		this.ctx.lineWidth = width;
	},
	
	/*
		Method:
			fillPath
		Fill the current path
	*/
	
	fillPath: function() {
		this.ctx.fill();
	},
	
	/*
		Method:
			strokePath
		Add a border around the current path
	*/
	
	strokePath: function() {
		this.ctx.stroke();
	},
	
	/*
		Method:
			clear
		Clear the sheet (canvas) to it's initial blank state
	*/
	
	clear: function() {
		this.ctx.clearRect(0, 0, this.rect.size.width, this.rect.size.height);
	},
	
	destroy: function()  {
		// -- Bad style?
		window.KICKASSGAME.unregisterElement(this.canvas);
		// --
		
		this.canvas.parentNode.removeChild(this.canvas);
	}
});
var initKickAss = function() {
	// If an instance of KickAss is already present, we add a player
	if ( ! window.KICKASSGAME ) {
		window.KICKASSGAME = new KickAss();
		window.KICKASSGAME.begin();
	} else
		window.KICKASSGAME.addPlayer();
};

// No canvas support? Try Raphaël
if ( ! document.createElement('canvas').getContext ) {
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'complete' )
			initKickAss();
	};
	script.onload = initKickAss;
	script.src = 'raphael-min.js';
	document.getElementsByTagName('head')[0].appendChild(script);
} else
	initKickAss();})(exports || window);