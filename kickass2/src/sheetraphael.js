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
