
/*
	Class:
		MenuManager
	
	Manages anything that resembles a menu. Points, "Press esc to quit".
*/

var MenuManager = new Class({
	initialize: function() {
		this.numPoints = 0;
	},
	
	create: function() {
		// Container 
		this.container = document.createElement('div');
		this.container.className = 'KICKASSELEMENT';
		
		with ( this.container.style ) {
			position = 'fixed';
			bottom = '20px';
			right = '20px';
			font = '16pt Arial';
			color = 'black';
			zIndex = '1000000';
			textAlign = 'right';
		}
		document.body.appendChild(this.container);
		
		// Points view
		this.points = document.createElement('div');
		this.points.className = 'KICKASSELEMENT';
		this.points.style.fontSize = '30pt';
		this.points.innerHTML = this.numPoints;
		this.container.appendChild(this.points);
		
		// Esc to quit text
		this.escToQuit = document.createElement('div');
		this.escToQuit.className = 'KICKASSELEMENT';
		this.escToQuit.innerHTML = 'Press esc to quit';
		this.container.appendChild(this.escToQuit);
		
		this.fb = document.createElement('div');
		this.fb.innerHTML = '<iframe id="fb-box" src="http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FKick-Ass-Destroy-the-web%2F168200253236727&amp;width=292&amp;colorscheme=light&amp;show_faces=false&amp;stream=false&amp;header=false&amp;height=62" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:350px; height:70px;" allowTransparency="true"></iframe>';
		this.container.appendChild(this.fb);
		
		this.game.registerElement(this.container);
		this.game.registerElement(this.points);
		this.game.registerElement(this.escToQuit);
		this.game.registerElement(this.fb);
	},
	
	/*
		Method:
			addPoints
		
		Add points to the scorecard.
		
		Parameters:
			(int) killed - The number of points killed in 
	*/
	
	addPoints: function(killed) {
		this.numPoints += killed*10;
		this.points.innerHTML = this.numPoints;
	},
	
	destroy: function() {
		this.game.unregisterElement(this.container);
		this.game.unregisterElement(this.escToQuit);
		this.game.unregisterElement(this.points);
		this.game.unregisterElement(this.fb);
		
		this.container.parentNode.removeChild(this.container);
	}
});