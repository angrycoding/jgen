var Renderer = Class(function() {

	var instanceID = null;

	var viewPort = null;
	var tileElement = null;
	var styleElement = null;
	var tileViewPort = null;
	var spriteViewPort = null;
	var tileElementCache = {};

	var mapWidth = 0, mapHeight = 0;
	var tileWidth = 0, tileHeight = 0;
	var maxScrollX = 0, maxScrollY = 0;
	var viewPortWidth = 0, viewPortHeight = 0;

	var layersCount = 0, layersData = [];
	var cameraWidth = 0, cameraHeight = 0;

	var tileDefinitions = {};

	function recalcVariables() {
		maxScrollX = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		maxScrollY = Math.max(0, tileHeight * mapHeight - viewPortHeight);
	}

	function constructor() {
		instanceID = new Date().getTime().toString(16);
		viewPort = document.createElement('div');
		viewPort.style.position = 'relative';
		viewPort.style.overflow = 'hidden';
		tileViewPort = document.createElement('div');
		tileViewPort.id = ('jgen-tiles-' + instanceID);
		tileViewPort.style.position = 'absolute';
		viewPort.appendChild(tileViewPort);
		spriteViewPort = document.createElement('div');
		spriteViewPort.style.position = 'absolute';
		viewPort.appendChild(spriteViewPort);
		tileElement = document.createElement('div');
		styleElement = document.createElement('style');
		styleElement.setAttribute('type', 'text/css');
		document.head.appendChild(styleElement);
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
		tileViewPort.style.width = width + 'px';
		tileViewPort.style.height = height + 'px';
		spriteViewPort.style.width = width + 'px';
		spriteViewPort.style.height = height + 'px';
		target.appendChild(viewPort);
		recalcVariables();
	}

	function setTileDefinition(tileID, tileUrl, offsetX, offsetY) {
		var css = [];
		tileDefinitions[tileID] = [tileUrl, offsetX || 0, offsetY || 0];
		for (var tileID in tileDefinitions) {
			var tileDefinition = tileDefinitions[tileID];
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
				for (col = 0; col < tileW; col++) {
					tileID = cellData[tileX + col];
					cacheKey = (layer * 31 + row) * 31 + col;
					if (!(tile = tileElementCache[cacheKey])) {
						tile = tileElement.cloneNode(false);
						tile.style.zIndex = (layer * 2);
						tile.className = ('tile-' + tileID);
						tile.style.left = (tileWidth * col) + 'px';
						tile.style.top = (tileHeight * row) + 'px';
						tileViewPort.appendChild(tile);
						tile = tileElementCache[cacheKey] = [tile, tileID];
					} else if (tile[1] !== tileID) {
						tile[1] = tileID;
						tile[0].className = ('tile-' + tileID);
					}
				}
			}
		}
	}

	function setCamera(width, height) {
		cameraWidth = width;
		cameraHeight = height;
	}

	function addLayer(layerData) {
		layersData.push(layerData);
		layersCount = layersData.length;
	}

	return {

		constructor: constructor,
		addLayer: addLayer,
		setMapSize: setMapSize,
		setTileSize: setTileSize,
		setViewPort: setViewPort,
		setCamera: setCamera,
		setTileDefinition: setTileDefinition,

		addSprite: function(sprite) {
			var spriteView = sprite.getView();
			spriteViewPort.appendChild(spriteView);
		},

		render: function(scrollX, scrollY) {

			var cWidth = cameraWidth;
			var cHeight = cameraHeight;

			if (cWidth < 0) cWidth = (viewPortWidth + cWidth);
			if (cHeight < 0) cHeight = (viewPortHeight + cHeight);

			// return render(scrollX, scrollY);

			var aaa = (scrollX - cWidth);
			var bbb = (scrollY - cHeight);

			render(
				Math.max(0, Math.min(aaa, maxScrollX)),
				Math.max(0, Math.min(bbb, maxScrollY))
			);

			return [
				Math.max(
					Math.min(scrollX, cWidth),
					cWidth + (aaa - maxScrollX)
				),
				Math.max(
					Math.min(scrollY, cHeight),
					cHeight + (bbb - maxScrollY)
				)
			];
		}

	}

});