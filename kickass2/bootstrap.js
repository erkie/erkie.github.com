var initKickAss = function() {
	// If an instance of KickAss is already present, we add a player
	if ( ! window.KICKASSGAME ) {
		window.KICKASSGAME = new KickAss();
		window.KICKASSGAME.begin();
	} else
		window.KICKASSGAME.addPlayer();
};

// No canvas support? Try Raphaël
if ( ! document.createElement('canvas').getContext ) {
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'complete' )
			initKickAss();
	};
	script.onload = initKickAss;
	script.src = 'raphael-min.js';
	document.getElementsByTagName('head')[0].appendChild(script);
} else
	initKickAss();