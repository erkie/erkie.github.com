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
