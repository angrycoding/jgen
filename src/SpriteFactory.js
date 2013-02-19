define([
	'./Utils',
	'./Network',
	'./Sprite'
], function(Utils, Network, Sprite) {

	function SpriteFactoryException(spriteURI, message) {
		var msg = ('error loading sprite "' + spriteURI);
		if (message) msg += ('" with message "' + message + '"');
		return {
			file: spriteURI,
			message: message,
			toString: function() { return msg; }
		};
	}

	function createSpriteFactoryView(factoryID, cssProps) {
		var factoryCSS = {};
		var factoryClass = Utils.uniqueId('sprite-');
		factoryCSS[factoryClass] = cssProps;
		Utils.generateStyle(factoryID, factoryCSS);
		var factoryView = document.createElement('div');
		factoryView.className = factoryClass;
		return factoryView;
	}

	function SpriteFactory(definition, baseURI) {

		if (!Utils.isMap(definition)) {
			throw new SpriteFactoryException(
				baseURI, 'definition is not a map'
			);
		}

		var factoryHandlers = {};

		var spriteWidth = definition.width;
		var spriteHeight = definition.height;
		var spriteSource = definition.source;
		var spriteFrames = definition.frames;

		if (Utils.isString(baseURI))
			spriteSource = Utils.resolveURI(spriteSource, baseURI);

		var factoryID = Utils.uniqueId('jgen-sf-');

		var factoryView = createSpriteFactoryView(factoryID, {
			display: 'none',
			position: 'absolute',
			overflow: 'hidden',
			width: spriteWidth,
			height: spriteHeight,
			backgroundColor: 'red',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: [0, 0],
			backgroundImage: spriteSource
		});

		var Constructor = Sprite.bind(
			this, factoryView,
			definition, factoryHandlers
		);

		Constructor.event = function(id, handler) {
			if (typeof id !== 'number') return;
			if (handler instanceof Function) {
				factoryHandlers[id] = handler;
			} else delete factoryHandlers[id];
		};

		return Constructor;

	}

	SpriteFactory.krang = function(baseURI, spriteURI, load) {
		var spriteURI = Utils.resolveURI(spriteURI, baseURI);
		Network(spriteURI, function(spriteData) { try {
			spriteData = JSON.parse(spriteData);
			load(new SpriteFactory(spriteData, spriteURI));
		} catch (exception) {
			throw new SpriteFactoryException(spriteURI, exception.message);
		}}, function() { throw new SpriteFactoryException(spriteURI); });
	};

	return SpriteFactory;

});