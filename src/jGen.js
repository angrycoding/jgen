define([
	'./Utils',
	'./Timer',
	'./SceneFactory',
	'./SpriteFactory',
	'./Constants'
], function(Utils, Timer, SceneFactory, SpriteFactory, Constants) {

	function krang(baseURI, pluginURI, load) {
		var pluginURI = pluginURI.split('!');
		var action = pluginURI.shift().toLowerCase();
		pluginURI = pluginURI.join('!');
		if (action === 'map')
			SceneFactory.krang(baseURI, pluginURI, load);
		else if (action === 'sprite')
			SpriteFactory.krang(baseURI, pluginURI, load);
	}

	return {
		krang: krang,
		Utils: Utils,
		Timer: Timer,
		Constants: Constants
	};

});