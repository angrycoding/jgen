define([
	'./Utils',
	'./Network',
	'./Constants',
	'./Scene'
], function(Utils, Network, Constants, Scene) {


	function SceneFactory(definition, baseURI) {

		var mapWidth = definition.width;
		var mapHeight = definition.height;
		var tileWidth = definition.tilewidth;
		var tileHeight = definition.tileheight;
		var tileSet = definition.tileset;

		var AAA = [0];

		for (var c = 0; c < tileSet.length; c++) {

			var tileDef = tileSet[c];
			var tileSource = tileDef.source;

			if (Utils.isString(baseURI))
				tileSource = Utils.resolveURI(tileSource, baseURI);

			AAA.push({
				position: 'absolute',
				backgroundRepeat: 'no-repeat',
				backgroundImage: tileSource,
				backgroundPosition: [
					-(tileDef.x || 0),
					-(tileDef.y || 0)
				]
			});

		}

		Utils.generateStyle('FACTORY_ID', AAA, 'tile-');


		var flatData = [];
		var layers = definition.layer;

		for (var lIndex = 0; lIndex < layers.length; lIndex++) {
			for (var rIndex = 0; rIndex < mapHeight; rIndex++) {
				for (var cIndex = 0; cIndex < mapWidth; cIndex++) {
					var tileIndex = layers[lIndex][rIndex][cIndex];
					if (!tileIndex) flatData.push(0);
					else flatData.push('tile-' + tileIndex);
				}
			}
		}

		return Scene.bind(
			this,
			definition.width, definition.height,
			definition.tilewidth, definition.tileheight,
			flatData, layers.length
		);

	}

	SceneFactory.krang = function(baseURI, resourceURI, load) {
		var resourceURI = Utils.resolveURI(resourceURI, baseURI);
		Network(resourceURI, function(mapData) {
			try {
				mapData = JSON.parse(mapData);
				load(new SceneFactory(mapData, resourceURI));
			} catch (exception) {
				alert(['ERROR LOADING SCENE:', resourceURI, exception]);
			}
		}, function() {
			alert(['ERROR LOADING SCENE:', resourceURI]);
		});
	};

	return SceneFactory;
});