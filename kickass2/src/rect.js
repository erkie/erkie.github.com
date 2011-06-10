/*
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
