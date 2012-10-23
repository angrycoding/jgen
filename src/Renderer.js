var Renderer = Class(function() {

	var instanceID = null;
	var viewPort = null;
	var mapViewPort = null;
	var tileElement = null;
	var styleElement = null;
	var spriteViewPort = null;

	var mapWidth = 0, mapHeight = 0;
	var tileWidth = 0, tileHeight = 0;
	var maxScrollX = 0, maxScrollY = 0;
	var viewPortWidth = 0, viewPortHeight = 0;



	var cameraWidth = 0, cameraHeight = 0;

	var tileCache = {};
	var tileDefinitions = {};
	var mapData = [];

	function recalcVariables() {
		maxScrollX = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		maxScrollY = Math.max(0, tileHeight * mapHeight - viewPortHeight);
	}

	function constructor() {
		instanceID = new Date().getTime().toString(16);
		tileElement = document.createElement('div');
		styleElement = document.createElement('style');
		styleElement.setAttribute('type', 'text/css');
		document.head.appendChild(styleElement);
		viewPort = document.createElement('div');
		viewPort.id = ('jgen-' + instanceID);
		viewPort.style.position = 'relative';
		viewPort.style.overflow = 'hidden';
		mapViewPort = document.createElement('div');
		mapViewPort.style.position = 'absolute';
		spriteViewPort = document.createElement('div');
		spriteViewPort.style.position = 'absolute';
		viewPort.appendChild(mapViewPort);
		viewPort.appendChild(spriteViewPort);
	}

	function setCamera(width, height) {
		cameraWidth = width;
		cameraHeight = height;
	}

	function setMapSize(width, height) {
		mapWidth = width;
		mapHeight = height;
		recalcVariables();
	}

	function setTileSize(width, height) {
		tileWidth = width;
		tileHeight = height;
		recalcVariables();
	}

	function setViewPort(target, width, height) {
		viewPortWidth = width;
		viewPortHeight = height;
		viewPort.style.width = width + 'px';
		viewPort.style.height = height + 'px';
		mapViewPort.style.width = width + 'px';
		mapViewPort.style.height = height + 'px';
		spriteViewPort.style.width = width + 'px';
		spriteViewPort.style.height = height + 'px';
		target.appendChild(viewPort);
		recalcVariables();
	}

	function setTileDefinition(tileID, tileWidth, tileHeight, tileUrl) {
		var css = [];
		tileDefinitions[tileID] = [tileWidth, tileHeight, tileUrl];
		for (var tileID in tileDefinitions) {
			var tileDefinition = tileDefinitions[tileID];
			css.push('#jgen-' + instanceID);
			css.push('.tile-' + tileID + '{');
			css.push('position: absolute;');
			css.push('width: ' + tileDefinition[0] + 'px;');
			css.push('height: ' + tileDefinition[1] + 'px;');
			css.push('background-repeat: no-repeat;');
			css.push('background-image: url("' + tileDefinition[2] + '");')
			css.push('}');
		}
		styleElement.innerHTML = css.join('\n');
	}

	function render(scrollX, scrollY) {
		var row, col, tile, tileID, cacheKey;
		var marginLeft = (scrollX % tileWidth);
		var marginTop = (scrollY % tileHeight);
		mapViewPort.style.left = -marginLeft + 'px';
		mapViewPort.style.top = -marginTop + 'px';
		var tileX = Math.floor(scrollX / tileWidth);
		var tileY = Math.floor(scrollY / tileHeight);
		var tileW = Math.ceil((viewPortWidth + marginLeft) / tileWidth);
		var tileH = Math.ceil((viewPortHeight + marginTop) / tileHeight);
		for (row = 0; row < tileH; row++) {
			for (col = 0; col < tileW; col++) {
				cacheKey = ((col << 16) | row);
				if (!tileCache.hasOwnProperty(cacheKey)) {
					tile = tileElement.cloneNode(false);
					tile.style.left = (tileWidth * col) + 'px';
					tile.style.top = (tileHeight * row) + 'px';
					mapViewPort.appendChild(tile);
					tileCache[cacheKey] = tile;
				} else tile = tileCache[cacheKey];
				tileID = mapData[tileY + row][tileX + col];
				tile.className = ('tile-' + tileID);
			}
		}
	}

	function setMapData(data) {
		mapData = data;
	}

	var sprites = [];

	return {

		constructor: constructor,
		setMapData: setMapData,
		setMapSize: setMapSize,
		setTileSize: setTileSize,
		setViewPort: setViewPort,
		setCamera: setCamera,
		setTileDefinition: setTileDefinition,

		addSprite: function(sprite) {
			sprites.push(sprite);
			spriteViewPort.appendChild(sprite.getView());
		},

		getCamera: function() {
			return Math.random();
		},

		render: function(scrollX, scrollY) {

			var aaa = (scrollX - cameraWidth);
			var bbb = (scrollY - cameraHeight);

			aaa = Math.max(0, Math.min(aaa, maxScrollX));
			bbb = Math.max(0, Math.min(bbb, maxScrollY));

			render(aaa, bbb);

			return [
				Math.max(Math.min(scrollX, cameraWidth), scrollX - viewPortWidth),
				Math.max(Math.min(scrollY, cameraHeight), scrollY - viewPortHeight)
			];
		}

	}

});