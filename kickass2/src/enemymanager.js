/*
	Class:
		EnemyManager
	
	Take care of enemies.
*/
var ENEMYEID = 0;

var EnemyManager = new Class({
	initialize: function() {
		this.enemies = [];
		this.enemyMap = {};
	},
	
	update: function(tdelta) {
		for ( var i = 0, enemy; enemy = this.enemies[i]; i++ ) {
			// remove enemies proclaimed as dead
			if ( enemy.isDead ) {
				delete this.enemyMap[enemy.element.ENEMYEID];
				enemy.destroy();
				this.enemies.splice(i, 1);
				continue;
			}
			
			enemy.update(tdelta);
			
			// Check collisions
			if ( enemy.isActive ) {
				for ( var j = 0, player; player = this.game.players[j]; j++ ) {
					var rect = enemy.getRect();
					rect.pos.sub(this.game.scrollPos);
					if ( player.inRect(rect) ) {
						player.hit(enemy);
					}
				}
			}
		}
	},
	
	addEnemyFromElement: function(element) {
		if ( random(0, 10) < 5 )
			return;
		
		element.ENEMYEID = ENEMYEID++;
		
		var enemy = new Enemy(element);
		enemy.game = this.game;
		
		this.enemies.push(enemy);
		this.enemyMap[element.ENEMYEID] = enemy;
	},
	
	shotEnemy: function(element) {
		var enemy = this.enemyMap[element.ENEMYEID];
		if ( ! enemy ) return;
		
		enemy.wasShot();
	}
});
