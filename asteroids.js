function Asteroids()
{
	var that = this;
	
	var isIE = !!window.ActiveXObject; // IE gets less performance-intensive
	
	// configuration directions are placed in local variables
	var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	var playerVerts = [[-5, -7.5], [5, -7.5], [0, 7.5]];
	var types = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'CANVAS'];
	
	// units/second
	var speed = 5, maxSpeed = 25;
	var rotSpeed = 360;
	var bulletSpeed = 400;
	var particleSpeed = 400;
	
	var timeBetweenFire = 150; // how many milliseconds between shots
	var bulletRadius = 2;
	var maxParticles = isIE ? 10 : 40;
	var maxBullets = isIE ? 10 : 20;
	
	var FPS = isIE ? 30 : 50;
	
	this.pos = {x: 100, y: 100};
	this.vel = {x: 0, y: 0};
	this.dir = {x: 0, y: 1};
	this.keysPressed = {};
	this.firedAt = false;
	this.indexLastUpdated = new Date().getTime();
	this.bullets = [];
	this.scrollPos = {x: 0, y: 0};
	
	// Enemies lay first in this.enemies, when they are shot they are moved to this.dieing
	this.enemies = [];
	this.dieing = [];
	
	// Particles are created when something is shot
	this.particles = [];
	
	// things to shoot is everything textual and an element of type not specified in types
	function updateEnemyIndex() {		
		var all = document.getElementsByTagName('*');
		for ( var i = 0; i < all.length; i++ ) {
			if ( indexOf(types, all[i].tagName) == -1 && hasOnlyTextualChildren(all[i]) )
			{
				all[i].aSize = size(all[i]);
				that.enemies.push(all[i]);
			}
		}		
	};
	updateEnemyIndex();
	
	/*
		Math operations
	*/
	
	function radians(deg) {
		return deg * 0.0174532925;
	}
	
	function cp(vec) {
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
	};
	
	/*
		Misc operations
	*/
	
	function code(name) {
		var table = {'up': 38, 'down': 40, 'left': 37, 'right': 39};
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
		return {x: left, y: top, width: element.offsetWidth, height: element.offsetHeight};
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
			// <br /> doesn't count...
			if ( element.childNodes[i].nodeType != 3 && element.childNodes[i].tagName != 'BR' ) return false;
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
	document.body.appendChild(this.canvas);
	if ( typeof G_vmlCanvasManager != 'undefined' )
	{
		this.canvas = G_vmlCanvasManager.initElement(this.canvas);
	}
	this.ctx = this.canvas.getContext("2d");
	
	this.ctx.fillStyle = "black";
	this.ctx.strokeStyle = "black";
	
	/*
		== Events ==
	*/
	
	document.onkeydown = function(event) {
		event = event || window.event;
		that.keysPressed[event.keyCode] = true;
		if ( event.keyCode == code(' ')) {
			that.firedAt = 1;
		}
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' ')], event.keyCode) != -1 )
			return false;
	};
	
	document.onkeypress = function(event) {
		event = event || window.event;
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' ')], event.keyCode || event.which) != -1 )
			return false;
	};
	
	document.onkeyup = function(event) {
		event = event || window.event;
		that.keysPressed[event.keyCode] = false;
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' ')], event.keyCode) != -1 )
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
	
	/*
		Game loop
	*/
	
	var lastUpdate = new Date().getTime();
	this.update = function() {
		// ==
		// logic
		// ==
		
		var nowTime = new Date().getTime();
		var tDelta = (nowTime - lastUpdate) / 1000;
		lastUpdate = nowTime;
		
		if ( nowTime - this.indexLastUpdated > 5000 )
		{
			updateEnemyIndex();
			this.indexLastUpdated = nowTime;
		}
		
		this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
		this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
		
		// update
		if ( this.keysPressed[code('up')] ) { // move forward
			var l = len(this.vel) || 1;
			if ( l < 1 ) l *= 1.4;
			this.vel = add(this.vel, mul(this.dir, speed * tDelta * l));
		}
		
		if ( this.keysPressed[code('left')] ) { // rotate counter-clockwise
			this.dir = rotate(this.dir, radians(rotSpeed * tDelta * -1));
			this.vel = rotate(this.vel, radians(rotSpeed * tDelta * -1));
		}
		
		if ( this.keysPressed[code('right')] ) { // rotate clockwise
			this.dir = rotate(this.dir, radians(rotSpeed * tDelta));
		}
		
		if ( this.keysPressed[code(' ')] && nowTime - this.firedAt > timeBetweenFire ) { // fire
			this.bullets.push({'dir': cp(this.dir), 'pos': cp(this.pos), 'cameAlive': nowTime});
			this.firedAt = nowTime;
			
			if ( this.bullets.length > maxBullets ) {
				arrayRemove(this.bullets, 0);
			}
		}
		
		// cap speed
		if ( len(this.vel) > maxSpeed ) {
			this.vel = setLength(this.vel, maxSpeed);
		}
		
		// add velocity to player (physics)
		this.pos = add(this.pos, mul(this.vel, 2));
		
		// check bounds of player, if we go outside we scroll accordingly
		if ( this.pos.x > w )
		{
			window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
			this.pos.x = 0;
		}
		else if ( this.pos.x < 0 )
		{
			window.scrollTo(this.scrollPos.x - 50, this.scrollPos.y);
			this.pos.x = w;
		}
		
		if ( this.pos.y > h )
		{
			window.scrollTo(this.scrollPos.x, this.scrollPos.y + 100);
			this.pos.y = 0;
		}
		else if ( this.pos.y < 0 )
		{
			window.scrollTo(this.scrollPos.x, this.scrollPos.y - 100);
			this.pos.y = h;	
		}
		
		// decrease speed of player
		this.vel = mul(this.vel, 0.95);
		
		// update positions of bullets
		
		for ( var i = 0; i < this.bullets.length; i++ ) {
			if ( nowTime - this.bullets[i].cameAlive > 2000 )
			{
				arrayRemove(this.bullets, i);
				i--;
				continue;
			}
			
			this.bullets[i].pos = add(this.bullets[i].pos, mul(this.bullets[i].dir, bulletSpeed * tDelta));
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
			try {
				enemy.parentNode.removeChild(enemy);
			} catch ( e ) {}
			
			arrayRemove(this.dieing, i);
			i--;
		}
		
		// update particles position
		for ( var i = 0; i < this.particles.length; i++ ) {
			this.particles[i].pos = add(this.particles[i].pos, mul(this.particles[i].dir, particleSpeed * tDelta * Math.random()));
			boundsCheck(this.particles[i].pos);
			
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
		
		// draw bullets
		for ( var i = 0; i < this.bullets.length; i++ ) {
			this.ctx.drawBullet(this.bullets[i].pos);
		}
		
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
}

if ( window.ActiveXObject )
{
	var script = document.createElement("script");
    script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'completed' ) {
			new Asteroids();
		}
	};
    script.src = "excanvas.js";    
	document.getElementsByTagName('head')[0].appendChild(script);
	
	try {
    	var xamlScript = document.createElement('script');
	    xamlScript.setAttribute('type', 'text/xaml');
	    xamlScript.innerHTML = '<?xml version="1.0"?><Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas>';
		document.getElementsByTagName('head')[0].appendChild(xamlScript);
	} catch ( e ) {}
}
else
	new Asteroids();