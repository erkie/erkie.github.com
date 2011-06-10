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
