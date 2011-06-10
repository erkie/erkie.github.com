/*
	Class:
		BulletManager
	
	Keeps track of all the bullets, collision detection, bullet life time
	and those things.
*/

var BulletManager = new Class({
	initialize: function() {
		this.bullets = {};
		this.lastFired = 0;
		
		this.lastBlink = 0;
		this.blinkActive = false;
		this.enemyIndex = [];
	},
	
	update: function(tdelta) {
		// If spacebar is pressed down, and only shoot every 0.1 second
		if ( this.game.isKeyPressed(' ') && now() - this.lastFired > 100 ) {
			for ( var i = 0, player; player = this.game.players[i]; i++ )
				if ( ! player.isBroken )
					this.addBulletFromPlayer(player);
			this.lastFired = now();
		}
		
		// If B is pressed, show remaining enemies
		if ( this.game.isKeyPressed('B') ) {
			this.blink();
		} else {
			this.endBlink();
		}
		
		for ( var key in this.bullets ) if ( this.bullets.hasOwnProperty(key) ) {
			var time = now(); // the time... is now
			
			// Remove bullets older than 2 seconds
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ ) {
				if ( time - bullet.bornAt > 2000 ) {
					bullet.destroy();
					this.bullets[key].splice(i, 1);
				}
			}
		
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ ) {
				bullet.update(tdelta);
				
				// Hide everything related to this game so it can't be hit
				this.game.hideAll();
				
				var hit = bullet.checkCollision();
				
				// If we hit something remove the element, add an explosion and remove the bullet
				if ( hit ) {
					if ( this.game.enemyManager.enemies.length <= 10 ) {
						this.game.explosionManager.addExplosion(bullet.pos);
						this.game.menuManager.addPoints(hit.getElementsByTagName('*').length + 1);
					
						if ( ! hit.isShot ) {
							this.game.enemyManager.addEnemyFromElement(hit);
						} else {
							this.game.enemyManager.shotEnemy(hit);
						}
					
						bullet.destroy();
						this.bullets[key].splice(i, 1);
					} else {
						if ( hit.isShot ) {
							this.game.explosionManager.addExplosion(bullet.pos);
							this.game.enemyManager.shotEnemy(hit);
							
							bullet.destroy();
							this.bullets[key].splice(i, 1);
						}
					}
				}
				
				// Show it again
				this.game.showAll();
			}
		}
	},
	
	/*
		Method:
			blink
		
		Shows a red border around all remaining enemies every 0.25 seconds
	*/
	
	blink: function() {
		if ( now() - this.lastBlink > 250 ) {
			for ( var i = 0, el; el = this.enemyIndex[i]; i++ ) {
				if ( ! this.blinkActive )
					el.style.outline = '1px solid red';
				else
					el.style.outline = el.KICKASSOLDBORDER;
			}					
			this.blinkActive = ! this.blinkActive;
			this.lastBlink = now();
			
			if ( ! this.blinkActive ) {
				this.updateEnemyIndex();
			}
		}
	},
	
	/*
		Method:
			endBlink
		
		End any blinking action (if there is any)
	*/
	
	endBlink: function() {
		// endBlink is called every run loop if B isn't pressed, so only
		// reset everything if there is something to reset
		if ( this.enemyIndex.length ) {
			for ( var i = 0, el; el = this.enemyIndex[i]; i++ )
				el.style.outline = el.KICKASSOLDBORDER;
			
			this.enemyIndex = [];
			this.lastBlink = 0;
			this.blinkActive = false;
		}
	},
	
	/*
		Method:
			updateEnemyIndex
		
		Update index of destroyable enemies
	*/
	
	updateEnemyIndex: function() {
		var all = document.getElementsByTagName('*');
		this.enemyIndex = [];
		
		for ( var i = 0, el; el = all[i]; i++ ) {
			if ( this.hasOnlyTextualChildren(el) ) {
				this.enemyIndex.push(el);
				
				el.KICKASSOLDBORDER = el.style.outline || (document.defaultView.getComputedStyle(el, null).outline);
			}
		}
	},
	
	/*
		Method:
			addBulletFromPlayer
		
		Add bullet at the position of a player's cannon
	*/
	
	addBulletFromPlayer: function(player) {
		var pid = player.id;
		
		// If the player has more than 10 bullets, remove the oldest one
		if (this.bullets[pid] && this.bullets[pid].length > 10 ) {
			this.bullets[pid][0].destroy();
			this.bullets[pid].shift();
		}
		
		var bullet = new Bullet();
		bullet.manager = this;
		bullet.pos = player.pos.cp();
		bullet.dir = player.dir.cp();
		bullet.game = this.game;
		
		// Make sure the bullet is traveling faster than the player
		bullet.vel.add(bullet.vel.cp().setLength(player.vel.len()));
		
		// Bullets are stored per ship, ensure we have an array for this ship
		if ( ! this.bullets[pid] )
			this.bullets[pid] = [];
		
		this.bullets[pid].push(bullet);	
	},
	
	/*
		Method:
			hasOnlyTextualChildren
		
		Find out if an element is suitable for destruction by checking if it
		only has "textual" children. It wouldn't be too fun a game if you could
		simply destroy the wrapper-div of a page on your first shot, right?
	*/
	
	hasOnlyTextualChildren: function(element) {
		if ( element == document.defaultView || element == document.body)
			return false;
		
		if ( element.className && element.className.indexOf('KICKASSELEMENT') != -1 )
			return false;
		
		for ( var i = 0; i < element.childNodes.length; i++ ) {
			if (element.childNodes[i].childNodes[0]) {
				var children = element.childNodes;
				for ( var i = 0, child; child = children[i]; i++ ) {
					if ( child.nodeType != 1 || child.style.visibility == 'hidden' || child.style.display == 'none' )
						continue;
					
					if ( child.offsetHeight == 0 || child.offsetWidth == 0 )
						continue;
					
					if ( ELEMENTSTHATCOUNTASTEXTUAL.indexOf(child.tagName) == -1 && ELEMENTSTHATARENOTTOBEINCLUDED.indexOf(child.tagName) == -1 )
						return false;
				}
			}
		}
		return true;
	},
	
	destroy: function() {
		for ( var key in this.bullets ) if ( this.bullets.hasOwnProperty(key) ) 
			for ( var i = 0, bullet; bullet = this.bullets[key][i]; i++ )
				bullet.destroy();
		this.bullets = {};
	}
});

