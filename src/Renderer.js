var Renderer = Class(function() {

	var styleEl = null;
	var viewPort = null;
	var mapViewPort = null;

	var mapWidth = 0, mapHeight = 0;
	var tileWidth = 0, tileHeight = 0;
	var viewPortWidth = 0, viewPortHeight = 0;

	var screenTiles = null;
	var viewPortWidthTiles = 0;
	var viewPortHeightTiles = 0;
	var maxScrollX = 0, maxScrollY = 0;

	var toCol = 0, toRow = 0;
	var marginLeft = 0, marginTop = 0;

	var tileDefinitions = {};
	var mapData = [];

	function recalcVariables() {
		maxScrollX = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		maxScrollY = Math.max(0, tileHeight * mapHeight - viewPortHeight);
		viewPortWidthTiles = Math.ceil(viewPortWidth / tileWidth) + 1;
		viewPortHeightTiles = Math.ceil(viewPortHeight / tileHeight) + 1;
		mapViewPort.innerHTML = '';
		var tileElement = document.createElement('div');
		tileElement.style.position = 'absolute';
		for (var row = 0; row < viewPortHeightTiles; row++) {
			for (var col = 0; col < viewPortWidthTiles; col++) {
				var f = tileElement.cloneNode(false);
				f.style.left = (tileWidth * col) + 'px';
				f.style.top = (tileHeight * row) + 'px';
				mapViewPort.appendChild(f);
			}
		}
	}

	function constructor() {
		styleEl = document.createElement('style');
		styleEl.setAttribute('type', 'text/css');
		document.head.appendChild(styleEl);
		viewPort = document.createElement('div');
		viewPort.style.overflow = 'hidden';
		mapViewPort = document.createElement('div');
		mapViewPort.style.position = 'relative';
		viewPort.appendChild(mapViewPort);
		screenTiles = mapViewPort.getElementsByTagName('div');
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
		target.appendChild(viewPort);
		recalcVariables();
	}

	function setTileDefinition(tileID, tileWidth, tileHeight, tileUrl) {
		var css = [];
		tileDefinitions[tileID] = [tileWidth, tileHeight, tileUrl];
		for (var tileID in tileDefinitions) {
			var tileDefinition = tileDefinitions[tileID];
			css.push('.tile-' + tileID + '{');
			css.push('width: ' + (tileDefinition[0] - 1) + 'px;');
			css.push('height: ' + (tileDefinition[1] - 1) + 'px;');
			css.push('background-repeat: no-repeat;');
			css.push('background-image: url("' + tileDefinition[2] + '");')
			css.push('}');
		}
		styleEl.innerHTML = css.join('\n');
	}

	function setMapData(data) {
		mapData = data;
	}


	return {

		constructor: constructor,
		setMapData: setMapData,
		setMapSize: setMapSize,
		setTileSize: setTileSize,
		setViewPort: setViewPort,
		setTileDefinition: setTileDefinition,

		render: function(scrollX, scrollY) {
			scrollX = Math.max(0, Math.min(scrollX, maxScrollX));
			scrollY = Math.max(0, Math.min(scrollY, maxScrollY));
			var newMarginTop = (scrollY % tileHeight);
			var newMarginLeft = (scrollX % tileWidth);
			if (marginTop !== newMarginTop ||
				marginLeft !== newMarginLeft) {
				marginTop = newMarginTop;
				marginLeft = newMarginLeft;
				mapViewPort.style.marginTop = -marginTop + 'px';
				mapViewPort.style.marginLeft = -marginLeft + 'px';
			}
			var cols = Math.ceil((viewPortWidth + marginLeft) / tileWidth);
			var rows = Math.ceil((viewPortHeight + marginTop) / tileHeight);
			if (toCol !== cols || toRow !== rows) {
				toCol = cols; toRow = rows;
				var fromCol = Math.floor(scrollX / tileWidth);
				var fromRow = Math.floor(scrollY / tileHeight);
				for (var row = 0; row < rows; row++) {
					for (var col = 0; col < cols; col++) {
						var tileID = mapData[fromRow + row][fromCol + col];
						screenTiles[row * viewPortWidthTiles + col].className = 'tile-' + tileID;
					}
				}
			}
		}
	}

});