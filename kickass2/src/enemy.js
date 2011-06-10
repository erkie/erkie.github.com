
/*
	Class:
		Enemy
*/


ENEMYFACELEMENT = new Image();
ENEMYFACELEMENT.src = 'http://i.imgur.com/ZtyvZ.png';

var Enemy = new Class({
	initialize: function(element) {
		this.element = element;
		this.pos = new Vector(0, 0);
		this.vel = (new Vector(75, 75)).mul(Math.sin(Math.PI*2*Math.random()));
		
		this.lives = getStyle(element, 'opacity');
		this.isDead = false;
		this.isAI = random(0, 7) == 3;
		
		var offset = getRect(element);
		
		element.style.width = offset.width + 'px';
		element.style.height = offset.height + 'px';
		
		document.body.appendChild(element);
		
		if ( offset.width < 10 ) {
			offset.width = 50;
			element.style.width = offset.width + 'px';
		}
		if ( offset.height < 10 ) {
			offset.height = 50;
			element.style.height = offset.height + 'px';
		}
		
		this.rect = new Rect(offset.left, offset.top, offset.width, offset.height);
		this.pos = this.rect.pos.cp();
		
		// Mark it as in zombie-mode
		this.element.isShot = true;
		
		// Prepare element for moving	
		element.style.position = 'absolute';
		element.style.left = this.rect.pos.x + 'px';
		element.style.top = this.rect.pos.y + 'px';
		element.style.margin = '0';
		element.style.outline = '1px dotted black';
		element.style.zIndex = '10000';
		this.rect.size = {width: offset.width, height: offset.height};
		
		this.isActive = false;
		this.blinkTheta = 0;
		
		if ( this.isAI )
			this.prepareFace();
	},
	
	prepareFace: function() {
		this.face = new Sheet(new Rect(this.rect.pos.x+this.rect.size.width/2, this.rect.pos.y+this.rect.size.height/2, this.rect.size.width, this.rect.size.height));
		this.face.drawFace(ENEMYFACELEMENT);
	},
	
	wasShot: function() {
		this.lives -= 0.20;
		
		if ( this.lives <= 0.25 ) {
			// dead
			this.isDead = true;
			return;
		}
		
		this.element.style.opacity = this.lives;
	},
	
	update: function(tdelta) {
		if ( this.isDead ) {
			return;
		}
		
		this.pos.add(this.vel.mulNew(tdelta));
		
		if ( this.isAI ) {
			this.face.setPosition(this.pos.cp().add(new Vector(this.rect.size.width/2, this.rect.size.height/2)));
		}
		
		if ( ! this.isActive ) {
			this.blinkTheta += tdelta;
			this.element.style.opacity = Math.cos(this.blinkTheta*10) * 0.25 + 0.75;
			if ( this.blinkTheta > 2.0 && this.element.style.opacity > 0.98 ) {
				this.isActive = true;
				this.element.style.opacity = 1.0;
			}
		}
		
		this.checkBounds();
		
		this.element.style.left = this.pos.x + 'px';
		this.element.style.top = this.pos.y + 'px';
	},
	
	checkBounds: function() {
		// Check bounds by checking if the real position plus pos (which is position delta)
		// is outside the viewport bounds
		var realPos = this.pos.cp();
		var vSize = this.game.windowSize;
		var vPos = this.game.scrollPos;
		
		// Out of bounds to:
		// 	left
		if ( realPos.x+this.rect.size.width/2 < vPos.x ) {
			this.pos.x += vSize.width - this.rect.size.width/2;
		// 	right
		} else if ( realPos.x + this.rect.size.width > vPos.x + vSize.width ) {
			this.pos.x -= vSize.width - this.rect.size.width;
		}
		
		// top
		if ( realPos.y+this.rect.size.height/2 < vPos.y ) {
			this.pos.y += vSize.height - this.rect.size.height/2;
		// bottom
		} else if ( realPos.y + this.rect.size.height > vPos.y + vSize.height ) {
			this.pos.y -= vSize.height - this.rect.size.height;
		}
	},
	
	getRect: function() {
		var realPos = this.pos.cp();
		return new Rect(realPos.x+this.rect.size.width/2, realPos.y+this.rect.size.height/2, this.rect.size.width, this.rect.size.height);
	},
	
	destroy: function() {
		this.element.parentNode.removeChild(this.element);
		if ( this.face )
			this.face.destroy();
	}
});
