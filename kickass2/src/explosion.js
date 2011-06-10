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
