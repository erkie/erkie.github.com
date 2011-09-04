// See license: https://github.com/erkie/erkie.github.com/blob/master/README

(function() {
function Asteroids() {
	if ( ! window.ASTEROIDS )
		window.ASTEROIDS = {
			enemiesKilled: 0,
			startedPlaying: (new Date()).getTime()
		};
	
	var BASEPATH = 'http://kickassapp.com/';
	
	/*
		Classes
	*/
	
	function Vector(x, y) {
		if ( typeof x == 'Object' ) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
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
		
		toString: function() {
			return '[Vector(' + this.x + ', ' + this.y + ') angle: ' + this.angle() + ', length: ' + this.len() + ']';
		}
	};
	
	function Line(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	};
	
	Line.prototype = {
		shift: function(pos) {
			this.p1.add(pos);
			this.p2.add(pos);
		},
		
		intersectsWithRect: function(rect) {
			var LL = new Vector(rect.x, rect.y + rect.height);
			var UL = new Vector(rect.x, rect.y);
			var LR = new Vector(rect.x + rect.width, rect.y + rect.height);
			var UR = new Vector(rect.x + rect.width, rect.y);
			
			if (
				this.p1.x > LL.x && this.p1.x < UR.x && this.p1.y < LL.y && this.p1.y > UR.y &&
				this.p2.x > LL.x && this.p2.x < UR.x && this.p2.y < LL.y && this.p2.y > UR.y
			) return true;

			if ( this.intersectsLine(new Line(UL, LL)) ) return true;
			if ( this.intersectsLine(new Line(LL, LR)) ) return true;
			if ( this.intersectsLine(new Line(UL, UR)) ) return true;
			if ( this.intersectsLine(new Line(UR, LR)) ) return true;
			return false;
		},
		
		intersectsLine: function(line2) {
			var v1 = this.p1, v2 = this.p2;
			var v3 = line2.p1, v4 = line2.p2;
			
			var denom = ((v4.y - v3.y) * (v2.x - v1.x)) - ((v4.x - v3.x) * (v2.y - v1.y));
			var numerator = ((v4.x - v3.x) * (v1.y - v3.y)) - ((v4.y - v3.y) * (v1.x - v3.x));
		
			var numerator2 = ((v2.x - v1.x) * (v1.y - v3.y)) - ((v2.y - v1.y) * (v1.x - v3.x));
			
			if ( denom == 0.0 ) {
				return false;
			}
			var ua = numerator / denom;
			var ub = numerator2 / denom;
			
			return (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0);
		}
	};
	
	function Highscores() {
	  
	};
	
	Highscores.prototype = {
	  build: function() {
	      var self = this;
	    
    		var w = (document.clientWidth || window.innerWidth || document.documentElement.clientWidth);
    		var h = (document.clientHeight || window.innerHeight || document.documentElement.clientHeight);

    		this.container = document.createElement('div');
    		this.container.className = "ASTEROIDSYEAH";
    		with ( this.container.style ) {
    			position = "fixed";
    			top = parseInt(h / 2 - 250, 10) + "px";
    			left = parseInt(w / 2 - 250, 10) + "px";
    			width = "500px";
    			height = "500px";
    			boxShadow = MsBoxShadow = OBoxShadow = MozBoxShadow = WebkitBoxShadow = "0 0 25px #000";
    			zIndex = "1000002";
				//webkitTransform causes a bug where you can't click anything in the iframe if the scroll is not top
    			//webkitTransform = 'scale(0, 0)';
    			//webkitTransition = "-webkit-transform 500ms";
    			background = '#222';
    		};
    		document.body.appendChild(this.container);

    		// Create iframe
    		this.iframe = document.createElement('iframe');
    		this.iframe.className = "ASTEROIDSYEAH";
    		this.iframe.width = this.iframe.height = 500;
    		this.iframe.frameBorder = 0;
    		this.container.appendChild(this.iframe);

    		// Create close button
    		this.close = document.createElement('a');
    		this.close.href = "#";
    		this.close.onclick = function() {
    			self.hide();
    			return false;
    		};
    		this.close.innerHTML = "X";
    		with ( this.close.style ) {
    			position = "absolute";
    			display = "block";
    			padding = "2px 6px";
    			top = "-12px";
    			right = "-12px";
    			background = "#222";
    			//textIndent = "-10000px";
    			border = "3px solid #fff";
    			boxShadow = "1px 1px 5px #000";
    			color = "#fff";
    			textAlign = "center";
    			borderRadius = "24px";
    			outline = "none";
    			textDecoration = "none";
    			fontFamily = "Verdana";
    			fontSize = "16px";
    			fontWeight = "bold";
    			zIndex = "10003";
    		}
    		this.container.appendChild(this.close);
    		this.hide();
    		
    		document.body.appendChild(this.container);
	  },
	  
		show: function() {
		  this.build();
		  this.container.style.display = 'block';
			
			var self = this;
			setTimeout(function() {
			  //self.container.style.webkitTransform = 'scale(1, 1)';
			}, 50);
			
			this.sendScore();
		},
		
		hide: function() {
			if ( this.container && this.container.parentNode )
				this.container.parentNode.removeChild(this.container);
		},
		
		sendScore: function() {
		  var timePlayed = (new Date()).getTime() - window.ASTEROIDS.startedPlaying;
			this.iframe.src = highscoreURL + "?asd=" + (window.ASTEROIDS.enemiesKilled * 10).toString() + "&sad=" + escape(document.location.href) + '&das=' + timePlayed;
		}
	};
	
	/*
		end classes, begin code
	*/
	
	var that = this;
	
	var isIE = !!window.ActiveXObject; // IE gets less performance-intensive
	var isIEQuirks = isIE && document.compatMode == "BackCompat";
	
	// configuration directives are placed in local variables
	var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	if ( isIEQuirks ) {
		w = document.body.clientWidth;
		h = document.body.clientHeight;
	}
	
	var playerWidth = 20, playerHeight = 30;
	
	var playerVerts = [[-1 * playerHeight/2, -1 * playerWidth/2], [-1 * playerHeight/2, playerWidth/2], [playerHeight/2, 0]];
	
	var ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'META', 'STYLE', 'LINK'];
	if ( window.ActiveXObject )
		ignoredTypes = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'TITLE', 'META', 'STYLE', 'LINK', 'SHAPE', 'LINE', 'GROUP', 'IMAGE', 'STROKE', 'FILL', 'SKEW', 'PATH', 'TEXTPATH', 'INS']; // Half of these are for IE g_vml
	var hiddenTypes = ['BR', 'HR'];
	
	var FPS = 50;
	
	// units/second
	var acc			  = 300;
	var maxSpeed	  = 600;
	var rotSpeed	  = 360; // one rotation per second
	var bulletSpeed	  = 700;
	var particleSpeed = 400;
	
	var timeBetweenFire = 150; // how many milliseconds between shots
	var timeBetweenBlink = 250; // milliseconds between enemy blink
	var timeBetweenEnemyUpdate = isIE ? 10000 : 2000;
	var bulletRadius = 2;
	var maxParticles = isIE ? 20 : 40;
	var maxBullets = isIE ? 10 : 20;
	
	var highscoreURL = BASEPATH + "highscores/";
	
	// generated every 10 ms
	this.flame = {r: [], y: []};
	
	// blink style
	this.toggleBlinkStyle = function () {
		if (this.updated.blink.isActive) {
			removeClass(document.body, 'ASTEROIDSBLINK');
		} else {
			addClass(document.body, 'ASTEROIDSBLINK');
		}

		this.updated.blink.isActive = !this.updated.blink.isActive;
	};

	addStylesheet(".ASTEROIDSBLINK .ASTEROIDSYEAHENEMY", "outline: 2px dotted red;");
	
	this.pos = new Vector(100, 100);
	this.lastPos = false;
	this.vel = new Vector(0, 0);
	this.dir = new Vector(0, 1);
	this.keysPressed = {};
	this.firedAt = false;
	this.updated = {
		enemies: false, // if the enemy index has been updated since the user pressed B for Blink
		flame: new Date().getTime(), // the time the flame was last updated
		blink: {time: 0, isActive: false}
	};
	this.scrollPos = new Vector(0, 0);
	
	this.bullets = [];
	
	// Enemies lay first in this.enemies, when they are shot they are moved to this.dying
	this.enemies = [];
	this.dying = [];
	this.totalEnemies = 0;
	
	// Particles are created when something is shot
	this.particles = [];
	
	// things to shoot is everything textual and an element of type not specified in types AND not a navigation element (see further down)
	function updateEnemyIndex() {
		for ( var i = 0, enemy; enemy = that.enemies[i]; i++ )
			removeClass(enemy, "ASTEROIDSYEAHENEMY");
			
		var all = document.body.getElementsByTagName('*');
		that.enemies = [];
		for ( var i = 0, el; el = all[i]; i++ ) {
			// elements with className ASTEROIDSYEAH are part of the "game"
			if ( indexOf(ignoredTypes, el.tagName.toUpperCase()) == -1 && el.prefix != 'g_vml_' && hasOnlyTextualChildren(el) && el.className != "ASTEROIDSYEAH" && el.offsetHeight > 0 ) {
				el.aSize = size(el);
				that.enemies.push(el);
				
				addClass(el, "ASTEROIDSYEAHENEMY");
				
				// this is only for enemycounting
				if ( ! el.aAdded ) {
					el.aAdded = true;
					that.totalEnemies++;
				}
			}
		}
	};
	updateEnemyIndex();
	
	// createFlames create the vectors for the flames of the ship
	var createFlames;
	(function () {
		var rWidth = playerWidth,
			rIncrease = playerWidth * 0.1,
			yWidth = playerWidth * 0.6,
			yIncrease = yWidth * 0.2,
			halfR = rWidth / 2,
			halfY = yWidth / 2,
			halfPlayerHeight = playerHeight / 2;

		createFlames = function () {
			// Firstly create red flames
			that.flame.r = [[-1 * halfPlayerHeight, -1 * halfR]];
			that.flame.y = [[-1 * halfPlayerHeight, -1 * halfY]];

			for ( var x = 0; x < rWidth; x += rIncrease ) {
				that.flame.r.push([-random(2, 7) - halfPlayerHeight, x - halfR]);
			}

			that.flame.r.push([-1 * halfPlayerHeight, halfR]);
			
			// ... And now the yellow flames
			for ( var x = 0; x < yWidth; x += yIncrease ) {
				that.flame.y.push([-random(2, 7) - halfPlayerHeight, x - halfY]);
			}

			that.flame.y.push([-1 * halfPlayerHeight, halfY]);
		};
	})();
	
	createFlames();
	
	/*
		Math operations
	*/
	
	function radians(deg) {
		return deg * 0.0174532925;
	};
	
	function degrees(rad) {
		return rad * 57.2957795;
	};
	
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
	
	// Taken from:
	// http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
	function addEvent( obj, type, fn ) {
		if (obj.addEventListener)
			obj.addEventListener( type, fn, false );
		else if (obj.attachEvent) {
			obj["e"+type+fn] = fn;
			obj[type+fn] = function() { obj["e"+type+fn]( window.event ); };
			obj.attachEvent( "on"+type, obj[type+fn] );
		}
	}

	function removeEvent( obj, type, fn ) {
		if (obj.removeEventListener)
			obj.removeEventListener( type, fn, false );
		else if (obj.detachEvent) {
			obj.detachEvent( "on"+type, obj[type+fn] );
			obj[type+fn] = null;
			obj["e"+type+fn] = null;
		}
	}
	
	function arrayRemove(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};
	
	function applyVisibility(vis) {
		for ( var i = 0, p; p = window.ASTEROIDSPLAYERS[i]; i++ ) {
			p.gameContainer.style.visibility = vis;
		}
	}
	
	function getElementFromPoint(x, y) {
		// hide canvas so it isn't picked up
		applyVisibility('hidden');

		var element = document.elementFromPoint(x, y);

		if ( ! element ) {
			applyVisibility('visible');
			return false;
		}

		if ( element.nodeType == 3 )
			element = element.parentNode;

		// show the canvas again, hopefully it didn't blink
		applyVisibility('visible');
		return element;
	};
	
	function addParticles(startPos) {
		var time = new Date().getTime();
		var amount = maxParticles;
		for ( var i = 0; i < amount; i++ ) {
			that.particles.push({
				// random direction
				dir: (new Vector(Math.random() * 20 - 10, Math.random() * 20 - 10)).normalize(),
				pos: startPos.cp(),
				cameAlive: time
			});
		}
	};
	
	function setScore() {
		that.points.innerHTML = window.ASTEROIDS.enemiesKilled * 10;
	};
	
	function hasOnlyTextualChildren(element) {
		if ( element.offsetLeft < -100 && element.offsetWidth > 0 && element.offsetHeight > 0 ) return false;
		if ( indexOf(hiddenTypes, element.tagName) != -1 ) return true;
		
		if ( element.offsetWidth == 0 && element.offsetHeight == 0 ) return false;
		for ( var i = 0; i < element.childNodes.length; i++ ) {
			// <br /> doesn't count... and empty elements
			if (
				indexOf(hiddenTypes, element.childNodes[i].tagName) == -1
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
	
	// taken from MooTools Core
	function removeClass(element, className) {
		element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
	};
	
	function addStylesheet(selector, rules) {
		var stylesheet = document.createElement('style');
		stylesheet.type = 'text/css';
		stylesheet.rel = 'stylesheet';
		stylesheet.id = 'ASTEROIDSYEAHSTYLES';
		try {
			stylesheet.innerHTML = selector + "{" + rules + "}";
		} catch ( e ) {
			stylesheet.styleSheet.addRule(selector, rules);
		}
		document.getElementsByTagName("head")[0].appendChild(stylesheet);
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
	this.gameContainer = document.createElement('div');
	this.gameContainer.className = 'ASTEROIDSYEAH';
	document.body.appendChild(this.gameContainer);
	
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', w);
	this.canvas.setAttribute('height', h);
	this.canvas.className = 'ASTEROIDSYEAH';
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
	
	// Is IE
	if ( typeof G_vmlCanvasManager != 'undefined' ) {
		this.canvas = G_vmlCanvasManager.initElement(this.canvas);
		if ( ! this.canvas.getContext ) {
			alert("So... you're using IE?  Please join me at http://github.com/erkie/erkie.github.com if you think you can help");
		}
	} else {
		if ( ! this.canvas.getContext ) {
			alert('This program does not yet support your browser. Please join me at http://github.com/erkie/erkie.github.com if you think you can help');
		}
	}
	
	addEvent(this.canvas, 'mousedown', function(e) {
		e = e || window.event;
		var message = document.createElement('span');
		message.style.position = 'absolute';
		message.style.border = '1px solid #999';
		message.style.background = 'white';
		message.style.color = "black";
		message.innerHTML = 'Press Esc to quit';
		document.body.appendChild(message);
		
		var x = e.pageX || (e.clientX + document.documentElement.scrollLeft);
		var y = e.pageY || (e.clientY + document.documentElement.scrollTop);
		message.style.left = x - message.offsetWidth/2 + 'px';
		message.style.top = y - message.offsetHeight/2 + 'px';
		
		setTimeout(function() {
			try {
				message.parentNode.removeChild(message);
			} catch ( e ) {}
		}, 1000);
	});
	
	var eventResize = function() {
		if ( ! isIE ) {
			that.canvas.style.display = "none";
			
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
			
			that.canvas.setAttribute('width', w);
			that.canvas.setAttribute('height', h);
			
			with ( that.canvas.style ) {
				display = "block";
				width = w + "px";
				height = h + "px";
			}
		} else {
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
			
			if ( isIEQuirks ) {
				w = document.body.clientWidth;
				h = document.body.clientHeight;
			}
			
			that.canvas.setAttribute('width', w);
			that.canvas.setAttribute('height', h);
		}
		forceChange = true;
	};
	addEvent(window, 'resize', eventResize);
	
	this.gameContainer.appendChild(this.canvas);
	this.ctx = this.canvas.getContext("2d");
	
	this.ctx.fillStyle = "black";
	this.ctx.strokeStyle = "black";
	
	// navigation wrapper element
	if ( ! document.getElementById('ASTEROIDS-NAVIGATION') ) {
		this.navigation = document.createElement('div');
		this.navigation.id = "ASTEROIDS-NAVIGATION";
		this.navigation.className = "ASTEROIDSYEAH";
		with ( this.navigation.style ) {
			fontFamily = "Arial,sans-serif";
			position = "fixed";
			zIndex = "10001";
			bottom = "0px";
			right = "10px";
			textAlign = "left";
			background = '#fff';
			color = '#222';
			padding = '2px';
			border = '1px solid #e1e1e1';
			boxShadow = '-2px -2px 15px #333';
			borderRadius = "3px";
		}
		this.gameContainer.appendChild(this.navigation);
		
		// points
		this.points = document.createElement('span');
		this.points.id = 'ASTEROIDS-POINTS';
		with ( this.points.style ) {
			font = '28pt Arial, sans-serif';
			fontWeight = 'bold';
			position = 'relative';
			left = '20px';
		}
		this.points.className = "ASTEROIDSYEAH";
		this.navigation.appendChild(this.points);
		
		// highscore link
		this.highscoreLink = document.createElement('a');
		this.highscoreLink.className = "ASTEROIDSYEAH";
		var css = {
			fontFamily: 'Arial',
			fontSize: '15px',
			fontWeight: 'normal',
			color: '#fff',
			background: '#333',
			textDecoration: 'none',
			display: 'inline',
			padding: '2px',
			borderRadius: '5px',
			position: 'relative',
			left: '30px',
			top: '-3px'
		}
		
		for ( var key in css ) if ( css.hasOwnProperty(key) )
		  this.highscoreLink.style[key] = css[key];
		
		this.highscoreLink.href = '#';
		this.highscoreLink.innerHTML = "Submit highscore";
		this.navigation.appendChild(this.highscoreLink);
		
		this.appstore = document.createElement('div');
		with ( this.appstore.style ) {
			position = 'fixed';
			top = '10px';
			right = '10px';
			zIndex = '9999999';
		}
		this.appstore.innerHTML = '<a href="http://itunes.apple.com/us/app/kick-ass-destroy-the-web/id436623109?mt=8&ls=1"><img src="http://erkie.github.com/appstore.png" style="border: none" alt="Get the mobile version" /></a>';
		this.gameContainer.appendChild(this.appstore);
		
		// fb like box
		this.fbLike = document.createElement('div');
		this.fbLike.innerHTML = '<iframe src="http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FKick-Ass-Destroy-the-web%2F168200253236727&amp;width=292&amp;colorscheme=light&amp;show_faces=false&amp;stream=false&amp;header=false&amp;height=62" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:70px;" allowTransparency="true"></iframe>';
		this.navigation.appendChild(this.fbLike);
	} else {
		this.navigation = document.getElementById('ASTEROIDS-NAVIGATION');
		this.points = document.getElementById('ASTEROIDS-POINTS');
	}
	
	// Because IE quirks does not understand position: fixed we set to absolute and just reposition it everything frame
	if ( isIEQuirks ) {
		this.gameContainer.style.position =
			this.canvas.style.position =
			this.navigation.style.position 
				= "absolute";
	}
	
	setScore();
	
	this.highscoreLink.onclick = function() {
		if ( ! that.highscores ) {
			that.highscores = new Highscores();
		}
		
	  that.highscores.show();
		return false;
	};
	
	// For ie
	if ( typeof G_vmlCanvasManager != 'undefined' ) {
		var children = this.canvas.getElementsByTagName('*');
		for ( var i = 0, c; c = children[i]; i++ )
			addClass(c, 'ASTEROIDSYEAH');
	}
	
	/*
		== Events ==
	*/
	
	var eventKeydown = function(event) {
		event = event || window.event;
		if ( event.ctrlKey || event.shiftKey )
			return;
		that.keysPressed[event.keyCode] = true;
		
		switch ( event.keyCode ) {
			case code(' '):
				that.firedAt = 1;
			break;
		}
		
		// check here so we can stop propagation appropriately
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' '), code('B'), code('W'), code('A'), code('S'), code('D')], event.keyCode) != -1 ) {
			if ( event.ctrlKey || event.shiftKey )
				return;
			
			if ( event.preventDefault )
				event.preventDefault();
			if ( event.stopPropagation)
				event.stopPropagation();
			event.returnValue = false;
			event.cancelBubble = true;
			return false;
		}
	};
	addEvent(document, 'keydown', eventKeydown);
	
	var eventKeypress = function(event) {
		event = event || window.event;
		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' '), code('W'), code('A'), code('S'), code('D')], event.keyCode || event.which) != -1 ) {
			if ( event.ctrlKey || event.shiftKey )
				return;
			
			if ( event.preventDefault )
				event.preventDefault();
			if ( event.stopPropagation )
				event.stopPropagation();
			event.returnValue = false;
			event.cancelBubble = true;
			return false;
		}
	};
	addEvent(document, 'keypress', eventKeypress);
	
	var eventKeyup = function(event) {
		event = event || window.event;
		that.keysPressed[event.keyCode] = false;

		if ( indexOf([code('up'), code('down'), code('right'), code('left'), code(' '), code('B'), code('W'), code('A'), code('S'), code('D')], event.keyCode) != -1 ) {
			if ( event.preventDefault )
				event.preventDefault();
			if ( event.stopPropagation )
				event.stopPropagation();
			event.returnValue = false;
			event.cancelBubble = true;
			return false;
		}
	};
	addEvent(document, 'keyup', eventKeyup);
	
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
		this.lineTo(xTo + 1, yTo + 1);
		this.closePath();
		this.fill();
	};
	
	this.ctx.tracePoly = function(verts) {
		this.beginPath();
		this.moveTo(verts[0][0], verts[0][1]);
		for ( var i = 1; i < verts.length; i++ )
			this.lineTo(verts[i][0], verts[i][1]);
		this.closePath();
	};
	
	var THEPLAYER = false;
	if ( window.KICKASSIMG ) {
		THEPLAYER = document.createElement('img');
		THEPLAYER.src = window.KICKASSIMG;
	}
	
	this.ctx.drawPlayer = function() {
		if ( ! THEPLAYER ) {
			this.save();
			this.translate(that.pos.x, that.pos.y);
			this.rotate(that.dir.angle());
			this.tracePoly(playerVerts);
			this.fillStyle = "white";
			this.fill();
			this.tracePoly(playerVerts);
			this.stroke();
			this.restore();
		} else {
			this.save();
			this.translate(that.pos.x, that.pos.y);
			this.rotate(that.dir.angle()+Math.PI/2);
			this.drawImage(THEPLAYER, -THEPLAYER.width/2, -THEPLAYER.height/2);
			this.restore();
		}
	};
	
	var PI_SQ = Math.PI*2;
	
	this.ctx.drawBullets = function(bullets) {
		for ( var i = 0; i < bullets.length; i++ ) {
			this.beginPath();
			this.arc(bullets[i].pos.x, bullets[i].pos.y, bulletRadius, 0, PI_SQ, true);
			this.closePath();
			this.fill();
		}
	};
	
	var randomParticleColor = function() {
		return (['red', 'yellow'])[random(0, 1)];
	};
	
	this.ctx.drawParticles = function(particles) {
		var oldColor = this.fillStyle;
		
		for ( var i = 0; i < particles.length; i++ ) {
			this.fillStyle = randomParticleColor();
			this.drawLine(particles[i].pos.x, particles[i].pos.y, particles[i].pos.x - particles[i].dir.x * 10, particles[i].pos.y - particles[i].dir.y * 10);
		}
		
		this.fillStyle = oldColor;
	};
	
	this.ctx.drawFlames = function(flame) {
		if ( THEPLAYER ) return;
		
		this.save();
		
		this.translate(that.pos.x, that.pos.y);
		this.rotate(that.dir.angle());
		
		var oldColor = this.strokeStyle;
		this.strokeStyle = "red";
		this.tracePoly(flame.r);
		this.stroke();
		
		this.strokeStyle = "yellow";
		this.tracePoly(flame.y);
		this.stroke();
		
		this.strokeStyle = oldColor;
		this.restore();
	};
	
	/*
		Game loop
	*/
	
	// Attempt to focus window if possible, so keyboard events are posted to us
	try {
		window.focus();
	} catch ( e ) {}
	
	addParticles(this.pos);
	addClass(document.body, 'ASTEROIDSYEAH');
	
	var isRunning = true;
	var lastUpdate = new Date().getTime();
	var forceChange = false;
	
	this.update = function() {
		// ==
		// logic
		// ==
		var nowTime = new Date().getTime();
		var tDelta = (nowTime - lastUpdate) / 1000;
		lastUpdate = nowTime;
		
		// update flame and timer if needed
		var drawFlame = false;
		if ( nowTime - this.updated.flame > 50 ) {
			createFlames();
			this.updated.flame = nowTime;
		}
		
		this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
		this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
		
		// update player
		// move forward
		if ( (this.keysPressed[code('up')]) || (this.keysPressed[code('W')]) ) {
			this.vel.add(this.dir.mulNew(acc * tDelta));
			
			drawFlame = true;
		} else {		
			// decrease speed of player
			this.vel.mul(0.96);
		}
		
		// rotate counter-clockwise
		if ( (this.keysPressed[code('left')]) || (this.keysPressed[code('A')]) ) {
			forceChange = true;
			this.dir.rotate(radians(rotSpeed * tDelta * -1));
		}
		
		// rotate clockwise
		if ( (this.keysPressed[code('right')]) || (this.keysPressed[code('D')]) ) {
			forceChange = true;
			this.dir.rotate(radians(rotSpeed * tDelta));
		}
		
		// fire
		if ( this.keysPressed[code(' ')] && nowTime - this.firedAt > timeBetweenFire ) {
			this.bullets.unshift({
				'dir': this.dir.cp(),
				'pos': this.pos.cp(),
				'startVel': this.vel.cp(),
				'cameAlive': nowTime
			});
			
			this.firedAt = nowTime;
			
			if ( this.bullets.length > maxBullets ) {
				this.bullets.pop();
			}
		}
		
		// add blink
		if ( this.keysPressed[code('B')] ) {
			if ( ! this.updated.enemies ) {
				updateEnemyIndex();
				this.updated.enemies = true;
			}
			
			forceChange = true;
			
			this.updated.blink.time += tDelta * 1000;
			if ( this.updated.blink.time > timeBetweenBlink ) {
				this.toggleBlinkStyle();
				this.updated.blink.time = 0;
			}
		} else {
			this.updated.enemies = false;
		}
		
		if ( this.keysPressed[code('esc')] ) {
			destroy.apply(this);
			return;
		}
		
		// cap speed
		if ( this.vel.len() > maxSpeed ) {
			this.vel.setLength(maxSpeed);
		}
		
		// add velocity to player (physics)
		this.pos.add(this.vel.mulNew(tDelta));
		
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
		
		// update positions of bullets
		for ( var i = this.bullets.length - 1; i >= 0; i-- ) {
			// bullets should only live for 2 seconds
			if ( nowTime - this.bullets[i].cameAlive > 2000 ) {
				this.bullets.splice(i, 1);
				forceChange = true;
				continue;
			}
			
			var bulletVel = this.bullets[i].dir.setLengthNew(bulletSpeed * tDelta).add(this.bullets[i].startVel.mulNew(tDelta));
			
			this.bullets[i].pos.add(bulletVel);
			boundsCheck(this.bullets[i].pos);
			
			// check collisions
			var murdered = getElementFromPoint(this.bullets[i].pos.x, this.bullets[i].pos.y);
			if (
				murdered && murdered.tagName &&
				indexOf(ignoredTypes, murdered.tagName.toUpperCase()) == -1 &&
				hasOnlyTextualChildren(murdered) && murdered.className != "ASTEROIDSYEAH"
			) {
				didKill = true;
				addParticles(this.bullets[i].pos);
				this.dying.push(murdered);
			
				this.bullets.splice(i, 1);
				continue;
			}
		}
		
		if (this.dying.length) {
			for ( var i = this.dying.length - 1; i >= 0; i-- ) {
				try {
					// If we have multiple spaceships it might have already been removed
					if ( this.dying[i].parentNode )
						window.ASTEROIDS.enemiesKilled++;

					this.dying[i].parentNode.removeChild(this.dying[i]);
				} catch ( e ) {}
			}

			setScore();
			this.dying = [];
		}

		// update particles position
		for ( var i = this.particles.length - 1; i >= 0; i-- ) {
			this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * tDelta * Math.random()));
			
			if ( nowTime - this.particles[i].cameAlive > 1000 ) {
				this.particles.splice(i, 1);
				forceChange = true;
				continue;
			}
		}
		
		// ==
		// drawing
		// ==
		
		// Reposition the canvas area for IE quirks because it does not understand position: fixed
		if ( isIEQuirks ) {
			this.gameContainer.style.left =
				this.canvas.style.left = document.documentElement.scrollLeft + "px";
			this.gameContainer.style.top =
				this.canvas.style.top = document.documentElement.scrollTop + "px";
			
			this.navigation.style.right = "10px";
			this.navigation.style.top
				= document.documentElement.scrollTop + document.body.clientHeight - this.navigation.clientHeight - 10 + "px";
		}
		
		// clear
		if ( forceChange || this.bullets.length != 0 || this.particles.length != 0 || ! this.pos.is(this.lastPos) || this.vel.len() > 0 ) {
			this.ctx.clear();
			
			// draw player
			this.ctx.drawPlayer();
			
			// draw flames
			if ( drawFlame )
				this.ctx.drawFlames(that.flame);
			
			// draw bullets
			if (this.bullets.length) {
				this.ctx.drawBullets(this.bullets);
			}
			
			// draw particles
			if (this.particles.length) {
				this.ctx.drawParticles(this.particles);
			}
		}
		this.lastPos = this.pos;
		forceChange = false;
	};
	
	// Start timer
	var updateFunc = function() {
		//try {
			that.update.call(that);
		/*}
		catch (e) {
			clearInterval(interval);
			throw e;
		}*/
	};
	var interval = setInterval(updateFunc, 1000 / FPS);
	
	function destroy() {
		clearInterval(interval);
		removeEvent(document, 'keydown', eventKeydown);
		removeEvent(document, 'keypress', eventKeypress);
		removeEvent(document, 'keyup', eventKeyup);
		removeEvent(window, 'resize', eventResize);
		isRunning = false;
		removeStylesheet("ASTEROIDSYEAHSTYLES");
		removeClass(document.body, 'ASTEROIDSYEAH');
		if ( this.highscores )
			this.highscores.hide();
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if ( ! window.ASTEROIDSPLAYERS )
	window.ASTEROIDSPLAYERS = [];

if ( window.ActiveXObject && ! document.createElement('canvas').getContext ) {
	try {
		var xamlScript = document.createElement('script');
		xamlScript.setAttribute('type', 'text/xaml');
		xamlScript.textContent = '<?xml version="1.0"?><Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas>';
		document.getElementsByTagName('head')[0].appendChild(xamlScript);
	} catch ( e ) {}

	var script = document.createElement("script");
	script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'complete' ) {
			if ( typeof G_vmlCanvasManager != "undefined" )
				window.ASTEROIDSPLAYERS[window.ASTEROIDSPLAYERS.length] = new Asteroids();
		}
	};
	script.src = "http://erkie.github.com/excanvas.js";
	document.getElementsByTagName('head')[0].appendChild(script);
}
else window.ASTEROIDSPLAYERS[window.ASTEROIDSPLAYERS.length] = new Asteroids();

})();
