/*
	Class:
		ExplosionManager
	
	Manager for explosions. 
*/

var ExplosionManager = new Class({
	initialize: function() {
		this.explosions = [];
	},
	
	update: function(tdelta) {
		var time = now();
		
		for ( var i = 0, explosion; explosion = this.explosions[i]; i++ ) {
			// Remove explosions older than 0.3 seconds
			if ( time - explosion.bornAt > 300 ) {
				explosion.destroy();
				this.explosions.splice(i, 1);
				continue;
			}
			
			// Update it
			explosion.update(tdelta);
		}
	},
	
	/*
		Method:
			addExplosion
		
		Add explosion at the center of a point.
		
		Parameters:
			(Vector) pos - The position of the explosion
	*/
	
	addExplosion: function(pos) {
		var explosion = new Explosion(pos);
		explosion.game = this.game;
		explosion.checkBounds();
		
		this.explosions.push(explosion);
	},
	
	destroy: function() {
		for ( var i = 0, explosion; explosion = this.explosions[i]; i++ )
			explosion.destroy();
		this.explosions = [];
	}
});
