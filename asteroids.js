function Asteroids() {
	var that = this;
	
	var isIE = !!window.ActiveXObject; // IE gets less performance-intensive
	
	// configuration directives are placed in local variables
	var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	var playerWidth = 20, playerHeight = 30;
	var playerVerts = [[-1 * playerWidth / 2, -15], [playerWidth / 2, -15], [0, 15]];

	// generated every 10 ms
	var flame = {r: [], y: []};
	
	var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS', 'META', 'STYLE'];
	var hiddenTypes = ['BR', 'HR'];
	
	var FPS = isIE ? 30 : 5;
	
	// units/second
	var speed = 5;
	var maxSpeed      = 600;
	var rotSpeed      = 360; // one rotation per second
	var bulletSpeed   = 700;
	var particleSpeed = 400;
	
	var timeBetweenFire = 150; // how many milliseconds between shots
	var timeBetweenBlink = 250; // milliseconds between enemy blink
	var bulletRadius = 2;
	var maxParticles = isIE ? 10 : 40;
	var maxBullets = isIE ? 10 : 20;
	
	// points
	this.enemiesKilled = 0;
	
	// blink style
	function addBlinkStyle() {
		addStylesheet("ASTEROIDSYEAH", ".ASTEROIDSYEAHENEMY { outline: 2px dotted red; }");
	};
	
	this.pos = {x: 100, y: 100};
	this.vel = {x: 0, y: 0};
	this.dir = {x: 0, y: 1};
	this.keysPressed = {};
	this.firedAt = false;
	this.updated = {
		enemies: new Date().getTime(), // the time before the enemyIndex was last updated
		flame: new Date().getTime(), // the time the flame was last updated
		blink: {time: 0, isActive: false}
	};
	this.scrollPos = {x: 0, y: 0};
	
	this.bullets = [];
	
	// Enemies lay first in this.enemies, when they are shot they are moved to this.dieing
	this.enemies = [];
	this.dieing = [];
	this.totalEnemies = 0;
	
	// Particles are created when something is shot
	this.particles = [];
	
	// things to shoot is everything textual and an element of type not specified in types AND not a navigation element (see further down)
	function updateEnemyIndex() {
		for ( var i = 0, enemy; enemy = that.enemies[i]; i++ ) {
			removeClass(enemy, "ASTEROIDSYEAHENEMY");
		}
			
		var all = document.body.getElementsByTagName('*');
		that.enemies = [];
		for ( var i = 0; i < all.length; i++ ) {
			// elements with className ASTEROIDSYEAH are part of the "game"
			if ( indexOf(ignoredTypes, all[i].tagName) == -1 && hasOnlyTextualChildren(all[i]) && all[i].className != "ASTEROIDSYEAH" ) {
				all[i].aSize = size(all[i]);
				that.enemies.push(all[i]);
				
				addClass(all[i], "ASTEROIDSYEAHENEMY");
				
				// this is only for enemycounting
				if ( ! all[i].aAdded ) {
					all[i].aAdded = true;
					that.totalEnemies++;
				}
			}
		}
	};
	updateEnemyIndex();
	
	function createFlames() {
		// Firstly create red flames
		flame.r = [[0, 0]];
		flame.y = [[0, 0]];
		
		var rWidth = playerWidth;
		var rIncrease = playerWidth * 0.1;
		for ( var x = 0; x < rWidth; x += rIncrease ) 
			flame.r.push([x, -random(2, 7)]);
		flame.r.push([rWidth, 0]);
		
		// yellow flames
		var yWidth = playerWidth * 0.6;
		var yIncrease = yWidth * 0.2;
		for ( var x = 0; x < yWidth; x += yIncrease )
			flame.y.push([x, -random(1, 4)]);
		flame.y.push([yWidth, 0]);
		
		// Center 'em
		var halfR = rWidth / 2, halfY = yWidth / 2;
		for ( var i = 0; i < flame.r.length; i++ ) {
			flame.r[i][0] -= halfR;
			flame.r[i][1] -= playerHeight / 2;
		}
		
		for ( var i = 0; i < flame.y.length; i++ ) {
			flame.y[i][0] -= halfY;
			flame.y[i][1] -= playerHeight / 2;
		}
	};
	createFlames();
	
	/*
		Math operations
	*/
	
	function Vector(x, y) {
		this.x = x;
		this.y = y;
	};
	
	Vector.prototype = {
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
			var x = this.x;
			this.x = x * Math.cos(angle) - Math.sin(angle) * this.y;
			this.y = x * Math.sin(angle) - Math.cos(angle) * this.y;
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
		
		normalize: function() {
			var l = this.len();
			this.x /= l;
			this.y /= l;
			return this;
		},
		
		normalizeNew: function() {
			return this.cp().normalize();
		},
		
		angle: function() {
			return Math.atan2(this.x, this.y);
		},
		
		collidesWith: function(rect) {
			return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
		},
		
		len: function() {
			var l = Math.sqrt(this.x * this.x + this.y * this.y);
			if ( l < 0.005 && l > -0.005) return 0;
			return l;
		}
	};
	
	function radians(deg) {
		return deg * 0.0174532925;
	}
	
/*	function cp(vec) {
		return {x: vec.x, y: vec.y};
	}
	
	function mul(vec1, factor) {
		return {x: vec1.x * factor, y: vec1.y * factor};
	}
	
	function add(vec1, vec2) {
		return {x: vec1.x + vec2.x, y: vec1.y + vec2.y};
	}
	
	function sub(vec1, vec2) {
		return {x: vec1.x - vec2.x, y: vec1.y - vec2.y};
	}
	
	function rotate(vec, angle) {
		return {
			x: vec.x * Math.cos(angle) - Math.sin(angle) * vec.y,
			y: vec.x * Math.sin(angle) + Math.cos(angle) * vec.y
		};
	};
	
	function setAngle(vec, angle) {
		var l = len(vec);
		vec.x = Math.cos(angle) * l;
		vec.y = Math.sin(angle) * l;
	};
	
	function setLength(vec, length) {
		var l = len(vec);
		if ( l ) return mul(vec, length / l);
		else return {x: l, y: vec.y};
	};
	
	function len(vec) {
		var l = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
		if ( l < 0.005 && l > -0.005) return 0;
		return l;
	};
	
	function normalize(vec) {
		var l = len(vec);
		return {x: vec.x / l, y: vec.y / l};
	};
	
	function angle(vec) {
		return Math.atan2(vec.x, vec.y);
	};
	
	function collidesWith(point, rect) {
		return point.x > rect.x && point.y > rect.y && point.x < rect.x + rect.width && point.y < rect.y + rect.height;
	};*/
	
	function random(from, to) {
		return Math.floor(Math.random() * (to + 1) + from);
	};
	
	/*
		Misc operations
	*/
	
	function code(name) {
		var table = {'up': 38, 'down': 40, 'left': 37, 'right': 39, 'esc': 27};
		if ( table[name] ) return table[name];
		return name.charCodeAt(0);
	};
	
	function boundsCheck(vec) {
		if ( vec.x > w )
			vec.x = 0;
		else if ( vec.x < 0 )
			vec.x = w;
		
		if ( vec.y > h )
			vec.y = 0;
		else if ( vec.y < 0 )
			vec.y = h;	
	};
	
	function size(element) {
		var el = element, left = 0, top = 0;
		do {
			left += el.offsetLeft || 0;
			top += el.offsetTop || 0;
			el = el.offsetParent;
		} while (el);
		return {x: left, y: top, width: element.offsetWidth || 10, height: element.offsetHeight || 10};
	};
	
	function arrayRemove(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};
	
	function addParticles(startPos) {
		var time = new Date().getTime();
		var amount = maxParticles;
		for ( var i = 0; i < amount; i++ ) {
			that.particles.push({
				// random direction
				dir: normalize({x: Math.random() * 20 - 10, y: Math.random() * 20 - 10}),
				pos: cp(startPos),
				cameAlive: time
			});
		}
	};
	
	function hasOnlyTextualChildren(element) {
		for ( var i = 0; i < element.childNodes.length; i++ ) {
			// <br /> doesn't count... and empty elements
			if (
				element.childNodes[i].nodeType != 3
				&& indexOf(hiddenTypes, element.childNodes[i].tagName) == -1
				&& element.childNodes[i].childNodes.length != 0
			) return false;
		}
		return true;
	};
	
	function indexOf(arr, item, from){
		if ( arr.indexOf ) return arr.indexOf(item, from);
		var len = arr.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (arr[i] === item) return i;
		}
		return -1;
	};
	
	// taken from MooTools Core
	function addClass(element, className) {
		if ( element.className.indexOf(className) == -1)
			element.className = (element.className + ' ' + className).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
	};
	
	// taken form MooTools Core
	function removeClass(element, className) {
		element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
	};
	
	function addStylesheet(name, rules) {
		var stylesheet = document.getElementById(name);
		if ( ! stylesheet ) {
			var stylesheet = document.createElement('style');
			stylesheet.type = 'text/css';
			stylesheet.rel = 'stylesheet';
			stylesheet.id = name;
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
		}
		stylesheet.innerHTML += rules;
	};
	
	function removeStylesheet(name) {
		var stylesheet = document.getElementById(name);
		if ( stylesheet ) {
			stylesheet.parentNode.removeChild(stylesheet);
		}
	};
	
	/*
		== Setup ==
	*/
	
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', w);
	this.canvas.setAttribute('height', h);
	with ( this.canvas.style ) {
		width = w + "px";
		height = h + "px";
		position = "fixed";
		top = "0px";
		left = "0px";
		bottom = "0px";
		right = "0px";
		zIndex = "10000";
	}
	if ( typeof G_vmlCanvasManager != 'undefined' ) {
		this.canvas = G_vmlCanvasManager.initElement(this.canvas);
		if ( ! this.canvas.getContext ) {
			alert("So... you're using IE?  Please contact me at erik.rothoff@gmail.com if you want me to work on it");
		}
	} else {
		if ( ! this.canvas.getContext ) {
			alert('This program does not yet support your browser. Please contact me at erik.rothoff@gmail.com if you want me to work on it');
		}
	}
	document.body.appendChild(this.canvas);
	this.ctx = this.canvas.getContext("2d");
	
	this.ctx.fillStyle = "black";
	this.ctx.strokeStyle = "black";
	
	this.navigation = document.createElement('div');
	this.navigation.className = "ASTEROIDSYEAH";
	with ( this.navigation.style ) {
		font = "Arial,sans-serif";
		position = "fixed";
		zIndex = "10001";
		bottom = "10px";
		right = "10px";
	}
	this.navigation.innerHTML = "(esc to quit) ";
	document.body.appendChild(this.navigation);
	
	this.points = document.createElement('span');
	this.points.style.font = "28pt bold Arial,sans-serif";
	this.points.className = "ASTEROIDSYEAH";
	this.navigation.appendChild(this.points);
	
	this.points.innerHTML = "0";
	
	/*
		== Events ==
	*/
	
	document.onkeydown = function(event) {
		event = event || window.event;
		that.keysPressed[event.keyCode] = true;
		switch ( event.keyCode ) {
			case code(' '):
				that.firedAt = 1;
			break;
		}
		
		// check here so we can stop propogation appropriately
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' '), code('B')], event.keyCode) != -1 )
			return false;
	};
	
	document.onkeypress = function(event) {
		event = event || window.event;
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' ')], event.keyCode || event.which) != -1 )
			return false;
	};
	
	document.onkeyup = function(event) {
		event = event || window.event;
		that.keysPressed[event.keyCode] = false;
		switch ( event.keyCode ) {
			case code('B'):
				removeStylesheet("ASTEROIDSYEAH");
			break;
		}
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' '), code('B')], event.keyCode) != -1 )
			return false;
	}
	
	/*
		Context operations
	*/
	
	this.ctx.clear = function() {
		this.clearRect(0, 0, w, h);
	};
	
	this.ctx.clear();
	
	this.ctx.drawLine = function(xFrom, yFrom, xTo, yTo) {
		this.beginPath();
		this.moveTo(xFrom, yFrom);
		this.lineTo(xTo, yTo);
		this.closePath();
		this.stroke();
	};
	
	this.ctx.tracePoly = function(verts) {
		this.beginPath();
		this.moveTo(verts[0][0], verts[0][1]);
		for ( var i = 1; i < verts.length; i++ )
			this.lineTo(verts[i][0], verts[i][1]);
		this.closePath();
	};
	
	this.ctx.drawPlayer = function() {
		this.save();
		this.translate(that.pos.x, that.pos.y);
		this.rotate(-angle(that.dir));
		this.tracePoly(playerVerts);
		this.stroke();
		this.restore();
	};
	
	this.ctx.drawBullet = function(pos) {
		this.beginPath();
		this.arc(pos.x, pos.y, bulletRadius, 0, Math.PI*2, true);
		this.closePath();
		this.fill();
	};
	
	this.ctx.drawParticle = function(particle) {
		this.drawLine(particle.pos.x, particle.pos.y, particle.pos.x - particle.dir.x * 10, particle.pos.y - particle.dir.y * 10);
	};
	
	this.ctx.drawFlames = function(flame) {
		this.save();
		
		this.translate(that.pos.x, that.pos.y);
		this.rotate(-angle(that.dir));
		
		var oldColor = this.strokeStyle;
		this.strokeStyle = "red";
		this.tracePoly(flame.r);
		this.stroke();
		
		this.strokeStyle = "yellow";
		this.tracePoly(flame.y);
		this.stroke();
		
		this.strokeStyle = oldColor;
		this.restore();
	}
	
	/*
		Game loop
	*/
	
	var isRunning = true;
	var lastUpdate = new Date().getTime();
	this.update = function() {
		// ==
		// logic
		// ==
		
		var nowTime = new Date().getTime();
		var tDelta = (nowTime - lastUpdate) / 1000;
		lastUpdate = nowTime;
		
		// check enemy index timer and update that if needed
		if ( nowTime - this.updated.enemies > 5000 ) {
			updateEnemyIndex();
			this.updated.enemies = nowTime;
		}
		
		// update flame and timer if needed
		var drawFlame = false;
		if ( nowTime - this.updated.flame > 50 ) {
			createFlames();
			this.updated.flame = nowTime;
		}
		
		this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
		this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
		
		// update player
		if ( this.keysPressed[code('up')] ) { // move forward
			var l = len(this.vel) || 1;
			if ( l < 1 ) l *= 2;
			this.vel = add(this.vel, mul(this.dir, speed * tDelta * l));
			
			drawFlame = true;
		}
		
		// rotate counter-clockwise
		if ( this.keysPressed[code('left')] ) {
			this.dir = rotate(this.dir, radians(rotSpeed * tDelta * -1));
		}
		
		// rotate clockwise
		if ( this.keysPressed[code('right')] ) { 
			this.dir = rotate(this.dir, radians(rotSpeed * tDelta));
		}
		
		// fire
		if ( this.keysPressed[code(' ')] && nowTime - this.firedAt > timeBetweenFire ) {
			this.bullets.push({'dir': cp(this.dir), 'pos': cp(this.pos), 'cameAlive': nowTime});
			this.firedAt = nowTime;
			
			if ( this.bullets.length > maxBullets ) {
				arrayRemove(this.bullets, 0);
			}
		}
		
		if ( this.keysPressed[code('B')] ) {
			this.updated.blink.time += tDelta * 1000;
			if ( this.updated.blink.time > timeBetweenBlink ) {
				if ( this.updated.blink.isActive ) {
					removeStylesheet("ASTEROIDSYEAH");
					this.updated.blink.isActive = false;
				} else {
					addBlinkStyle();
					this.updated.blink.isActive = true;
				}
				this.updated.blink.time = 0;
			}
		}
		
		if ( this.keysPressed[code('esc')] ) {
			destroy.apply(this);
			return;
		}
		
		// cap speed
		if ( len(this.vel) > maxSpeed ) {
			this.vel = setLength(this.vel, maxSpeed);
		}
		
		// add velocity to player (physics)
		this.pos = add(this.pos, mul(this.vel, tDelta));
		
		// check bounds X of player, if we go outside we scroll accordingly
		if ( this.pos.x > w ) {
			window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
			this.pos.x = 0;
		} else if ( this.pos.x < 0 ) {
			window.scrollTo(this.scrollPos.x - 50, this.scrollPos.y);
			this.pos.x = w;
		}
		
		// check bounds Y
		if ( this.pos.y > h ) {
			window.scrollTo(this.scrollPos.x, this.scrollPos.y + h * 0.75);
			this.pos.y = 0;
		} else if ( this.pos.y < 0 ) {
			window.scrollTo(this.scrollPos.x, this.scrollPos.y - h * 0.75);
			this.pos.y = h;	
		}
		
		// decrease speed of player
		this.vel = mul(this.vel, 0.96);
		
		// update positions of bullets
		
		for ( var i = 0; i < this.bullets.length; i++ ) {
			if ( nowTime - this.bullets[i].cameAlive > 2000 ) {
				arrayRemove(this.bullets, i);
				i--;
				continue;
			}
			
			this.bullets[i].pos = add(this.bullets[i].pos, setLength(this.bullets[i].dir, bulletSpeed * tDelta));
			boundsCheck(this.bullets[i].pos);
			
			// check collisions
			var didKill = false;
			for ( var x = 0, enemy; enemy = this.enemies[x]; x++ ) {
				if ( collidesWith(add(this.bullets[i].pos, this.scrollPos), enemy.aSize) ) {
					// move to dieing
					this.dieing.push(enemy);
					arrayRemove(this.enemies, x);
					
					// the shot was a kill
					didKill = true;
					
					// create particles at position
					addParticles(this.bullets[i].pos);
					break;
				}
			}
			
			// If it hit something the bullet should go down with it
			if ( didKill ) {
				arrayRemove(this.bullets, i);
				i--;
				continue;
			}
		}
		
		// Remove all dieing elements
		for ( var i = 0, enemy; enemy = this.dieing[i]; i++ ) {
			this.enemiesKilled++;
			
			try {
				enemy.parentNode.removeChild(enemy);
			} catch ( e ) {}
			
			this.points.innerHTML = this.enemiesKilled * 10;
			this.points.title = this.enemiesKilled + "/" + this.totalEnemies;
			
			arrayRemove(this.dieing, i);
			i--;
		}
		
		// update particles position
		for ( var i = 0; i < this.particles.length; i++ ) {
			this.particles[i].pos = add(this.particles[i].pos, mul(this.particles[i].dir, particleSpeed * tDelta * Math.random()));
			
			if ( nowTime - this.particles[i].cameAlive > 1000 ) {
				arrayRemove(this.particles, i);
				i--;
				continue;
			}
		}
		
		// ==
		// drawing
		// ==
		
		// clear
		this.ctx.clear();
		
		// draw player
		this.ctx.drawPlayer();
		
		// draw flames
		if ( drawFlame )
			this.ctx.drawFlames(flame);
		
		// draw bullets
		for ( var i = 0; i < this.bullets.length; i++ ) {
			this.ctx.drawBullet(this.bullets[i].pos);
		}
		
		// draw particles
		for ( var i = 0; i < this.particles.length; i++ ) {
			this.ctx.drawParticle(this.particles[i]);
		}
		
		setTimeout(updateFunc, 1000 / FPS);
	}
	
	// Start timer
	var updateFunc = function() {
		that.update.call(that);
	};
	setTimeout(updateFunc, 1000 / FPS);
	
	function destroy() {
		window.onkeydown = window.onkeypress = window.onkeyup = null;
		isRunning = false;
		removeStylesheet("ASTEROIDSYEAH");
		this.canvas.parentNode.removeChild(this.canvas);
		this.navigation.parentNode.removeChild(this.navigation);
	};
}

if ( window.ActiveXObject )
{
	try {
    	var xamlScript = document.createElement('script');
	    xamlScript.setAttribute('type', 'text/xaml');
	    xamlScript.textContent = '<?xml version="1.0"?><Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas>';
		document.getElementsByTagName('head')[0].appendChild(xamlScript);
	} catch ( e ) {}
	
	var script = document.createElement("script");
    script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'completed' ) {
			new Asteroids();
		}
	};
    script.src = "excanvas.js";    
	document.getElementsByTagName('head')[0].appendChild(script);
}
else new Asteroids();