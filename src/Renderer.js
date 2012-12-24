var Renderer = (function() {

	var mapWidth = 0, mapHeight = 0;
	var tileWidth = 0, tileHeight = 0;
	var maxScrollX = 0, maxScrollY = 0;
	var viewPortWidth = 0, viewPortHeight = 0;

	var tileCache = {}, tiles = {};
	var layersCount = 0, layersData = [];

	var instanceID = new Date().getTime().toString(16);

	var viewPort = document.createElement('div');
	viewPort.style.position = 'relative';
	viewPort.style.overflow = 'hidden';

	var tileViewPort = document.createElement('div');
	tileViewPort.id = ('jgen-tiles-' + instanceID);
	tileViewPort.style.position = 'absolute';
	viewPort.appendChild(tileViewPort);

	var spriteViewPort = document.createElement('div');
	spriteViewPort.style.position = 'absolute';
	viewPort.appendChild(spriteViewPort);

	var tileElement = document.createElement('div');
	var styleElement = document.createElement('style');
	styleElement.setAttribute('type', 'text/css');
	document.head.appendChild(styleElement);

	function recalcVariables() {
		maxScrollX = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		maxScrollY = Math.max(0, tileHeight * mapHeight - viewPortHeight);
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

	function addLayer(layerData) {
		layersData.push(layerData);
		layersCount = layersData.length;
	}

	function setViewPort(target, width, height) {
		viewPortWidth = width;
		viewPortHeight = height;
		viewPort.style.width = width + 'px';
		viewPort.style.height = height + 'px';
		tileViewPort.style.width = width + 'px';
		tileViewPort.style.height = height + 'px';
		spriteViewPort.style.width = width + 'px';
		spriteViewPort.style.height = height + 'px';
		target.appendChild(viewPort);
		recalcVariables();
	}

	function setTileDefinition(tileID, tileUrl, offsetX, offsetY) {
		var css = [];
		tiles[tileID] = [tileUrl, offsetX || 0, offsetY || 0];
		for (var tileID in tiles) {
			var tileDefinition = tiles[tileID];
			css.push('#jgen-tiles-' + instanceID);
			css.push('.tile-' + tileID + '{');
			css.push('position: absolute;');
			css.push('width: ' + tileWidth + 'px;');
			css.push('height: ' + tileHeight + 'px;');
			css.push('background-repeat: no-repeat;');
			css.push('background-image: url("' + tileDefinition[0] + '");')
			css.push('background-position: -' + tileDefinition[1] + 'px -' + tileDefinition[2] + 'px;');
			css.push('}');
		}
		styleElement.innerHTML = css.join('\n');
	}

	function render(scrollX, scrollY) {

		if (scrollX < 0) scrollX = 0;
		if (scrollY < 0) scrollY = 0;
		if (scrollX > maxScrollX) scrollX = maxScrollX;
		if (scrollY > maxScrollY) scrollY = maxScrollY;

		var rowData, cellData, tileID;
		var layer, row, col, tile, cacheKey;
		var marginLeft = (scrollX % tileWidth);
		var marginTop = (scrollY % tileHeight);

		tileViewPort.style.left = -marginLeft + 'px';
		tileViewPort.style.top = -marginTop + 'px';

		var tileX = Math.floor(scrollX / tileWidth);
		var tileY = Math.floor(scrollY / tileHeight);
		var tileW = Math.ceil((viewPortWidth + marginLeft) / tileWidth);
		var tileH = Math.ceil((viewPortHeight + marginTop) / tileHeight);
		for (layer = 0; layer < layersCount; layer++) {
			rowData = layersData[layer];
			for (row = 0; row < tileH; row++) {
				cellData = rowData[tileY + row];
				if (!cellData) continue;
				for (col = 0; col < tileW; col++) {
					tileID = cellData[tileX + col];
					cacheKey = (layer * 31 + row) * 31 + col;
					if (!(tile = tileCache[cacheKey])) {
						tile = tileElement.cloneNode(false);
						tile.style.zIndex = (layer * 2);
						tile.className = ('tile-' + tileID);
						tile.style.left = (tileWidth * col) + 'px';
						tile.style.top = (tileHeight * row) + 'px';
						tileViewPort.appendChild(tile);
						tile = tileCache[cacheKey] = [tile, tileID];
					} else if (tile[1] !== tileID) {
						tile[1] = tileID;
						tile[0].className = ('tile-' + tileID);
					}
				}
			}
		}

		return [scrollX, scrollY];
	}

	return {

		render: render,
		addLayer: addLayer,
		setMapSize: setMapSize,
		setTileSize: setTileSize,
		setViewPort: setViewPort,
		setTileDefinition: setTileDefinition,

		addSprite: function(sprite) {
			var spriteView = sprite.getView();
			spriteViewPort.appendChild(spriteView);
		}

	}

});