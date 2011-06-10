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
