/*
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
});