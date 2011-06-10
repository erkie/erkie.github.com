/*
	Class:
		KickAss
	
	The main entry point for the game
*/

var KickAss = new Class({
	initialize: function() {
		// Holds all the player instances
		this.players = [];
		
		// Holds an array of elements related to this game
		// this should maybe be replaced with something wiser
		this.elements = [];
		
		// The manager of bullets
		this.bulletManager = new BulletManager();
		this.bulletManager.game = this;
		
		// The manager of enemies
		this.enemyManager = new EnemyManager();
		this.enemyManager.game = this;
		
		// The manager of explosions
		this.explosionManager = new ExplosionManager();
		this.explosionManager.game = this;
		
		// Manager for menus
		this.menuManager = new MenuManager();
		this.menuManager.game = this;
		this.menuManager.create();
		
		// Time of last game loop run
		this.lastUpdate = now();
		
		// A map of keys that are pressed
		this.keyMap = {};
		
		// Bind global events
		this.keydownEvent = bind(this, this.keydown);
		this.keyupEvent = bind(this, this.keyup);
		
		addEvent(document, 'keydown', this.keydownEvent);
		addEvent(document, 'keyup', this.keyupEvent);
		addEvent(document, 'keypress', this.keydownEvent);
		
		// We keep track of scrolling information and window size
		this.scrollPos = new Vector(0, 0);
		this.windowSize = {width: 0, height: 0};
		
		this.updateWindowInfo();
	},
	
	begin: function() {
		// Add first player
		this.addPlayer();
		
		// Begin loop
		this.loopTimer = window.setInterval(bind(this, this.loop), 1000/60);
	},
	
	keydown: function(e) {
		var c = code(e.keyCode);
		this.keyMap[c] = true;
		
		switch ( c) {
			// These events should be stopped
			case 'left':
			case 'right':
			case 'up':
			case 'down':
			case 'esc':
			case ' ':
				if ( e.stopPropogation )
					e.stopPropogation();
				if ( e.preventDefault )
					e.preventDefault();
				e.returnValue = false;
			break;
		}
		
		switch ( c ) {
			case 'esc':
				this.destroy();
				break;
		}
	},
	
	keyup: function(e) {
		var c = code(e.keyCode);
		this.keyMap[c] = false;
		
		switch ( c ) {
			// These events should be stopped
			case 'left':
			case 'right':
			case 'up':
			case 'down':
			case 'esc':
			case ' ':
				if ( e.stopPropogation )
					e.stopPropogation();
				if ( e.preventDefault )
					e.preventDefault();
				e.returnValue = false;
			break;
		}
	},
	
	/*
		Method:
			loop
		
		This is the game loop, subsequently, the most important part of the game.
		Takes care of updating everything, and seeing to that everything is drawn 
		as it should be.
	*/
	
	loop: function() {
		var currentTime = now();
		var tdelta = (currentTime - this.lastUpdate)/1000;
		
		this.updateWindowInfo();
		
		// Update every player
		for ( var i = 0, player; player = this.players[i]; i++ )
			player.update(tdelta);
		
		// Update bullets
		this.bulletManager.update(tdelta);
		
		// Update enemies
		this.enemyManager.update(tdelta);
		
		// Update explosions
		this.explosionManager.update(tdelta);
		
		this.lastUpdate = currentTime;
	},
	
	/*
		Method:
			addPlayer
		
		Adds a player controled by the user. For mega mayhem.
	*/
	
	addPlayer: function() {
		var player = new Player();
		player.game = this;
		
		this.players.push(player);
		
		this.explosionManager.addExplosion(player.pos);
	},
	
	/*
		Method:
			registerElement
		
		Register a DOM-element that belongs to the game
		
		Parameters:
			(element) el - The element to register. It should have the classname "KICKASSELEMENT"
							to avoid confusion
	*/
	
	registerElement: function(el) {
		this.elements.push(el);
	},
	
	/*
		Method:
			unregisterElement
		
		Remove an element registered with <registerElement>
		
		Parameters: See KickAss.registerElement
	*/
	
	unregisterElement: function(el) {
		this.elements.splice(this.elements.indexOf(el), 1);
	},
	
	/*
		Method:
			isKickAssElement
		
		Check if the passed element is child of a registered element.
		
		Parameters:
			(element) el - The element to check
	*/
	
	isKickAssElement: function(el) {
		for ( var i = 0, element; element = this.elements[i]; i++ ) {
			if ( el === element || elementIsContainedIn(element, el) )
				return true;
		}
		return false;
	},
	
	/*
		Method:
			isKeyPressed
		
		Check wether a key is pressed.
		
		Parameters:
			(string) key - The key to be checked if it's pressed
		
		Return:
			bool - True if it's pressed
	*/
	
	isKeyPressed: function(key) {
		return !! this.keyMap[key];
	},
	
	/*
		Method:
			updateWindowInfo
		
		Update information regarding the window, scroll position and size.
	*/
	
	updateWindowInfo: function() {
		var isIEQuirks = (!!window.ActiveXObject) && document.compatMode == "BackCompat";
		
		this.windowSize = {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		};
		
		if ( isIEQuirks ) {
			this.windowSize.width = document.body.clientWidth;
			this.windowSize.height = document.body.clientHeight;
		}
		
		this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
		this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;
	},
	
	/*
		Method:
			hideAll
		
		Hide everything related to Kick ass. This will be everything that has the
		classname "KICKASSELEMENT".
	*/
	
	hideAll: function() {
		for ( var i = 0, el; el = this.elements[i]; i++ )
			el.style.visibility = 'hidden';
	},
	
	/*
		Method:
			showAll
		
		This shows everything hidden by hideAll.
	*/
	
	showAll: function() {
		for ( var i = 0, el; el = this.elements[i]; i++ )
			el.style.visibility = 'visible';
	},
	
	/*
		Method:
			destroy
		
		Remove every trace of Kick Ass.
	*/
	
	destroy: function() {
		// Remove global events
		removeEvent(document, 'keydown', this.keydownEvent);
		removeEvent(document, 'keypress', this.keydownEvent);
		removeEvent(document, 'keyup', this.keyupEvent);
		
		// Destroy everything
		for ( var i = 0, player; player = this.players[i]; i++ )
			player.destroy();
		
		this.bulletManager.destroy();
		this.explosionManager.destroy();
		this.menuManager.destroy();
		
		// Stop game timer
		clearInterval(this.loopTimer);
	}
});