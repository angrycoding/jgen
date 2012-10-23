var Renderer = Class(function() {

	var tileEl = null;
	var styleEl = null;
	var viewPort = null;
	var mapViewPort = null;
	var spriteViewPort = null;

	var mapWidth = 0, mapHeight = 0;
	var tileWidth = 0, tileHeight = 0;
	var maxScrollX = 0, maxScrollY = 0;
	var viewPortWidth = 0, viewPortHeight = 0;

	var tileViewX = 0, tileViewY = 0;
	var tileViewLeft = 0, tileViewTop = 0;
	var tileViewWidth = 0, tileViewHeight = 0;

	var cameraWidth = 0, cameraHeight = 0;

	var tileCache = {};
	var tileDefinitions = {};
	var mapData = [];

	function recalcVariables() {
		maxScrollX = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		maxScrollY = Math.max(0, tileHeight * mapHeight - viewPortHeight);
	}

	function constructor() {
		tileEl = document.createElement('div');
		styleEl = document.createElement('style');
		styleEl.setAttribute('type', 'text/css');
		document.head.appendChild(styleEl);

		viewPort = document.createElement('div');
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
			css.push('.tile-' + tileID + '{');
			css.push('position: absolute;');
			css.push('width: ' + tileDefinition[0] + 'px;');
			css.push('height: ' + tileDefinition[1] + 'px;');
			css.push('background-repeat: no-repeat;');
			css.push('background-image: url("' + tileDefinition[2] + '");')
			css.push('}');
		}
		styleEl.innerHTML = css.join('\n');
	}

	function render(scrollX, scrollY) {

		var newTileViewX = (scrollX % tileWidth);
		var newTileViewY = (scrollY % tileHeight);
		var newTileViewLeft = Math.floor(scrollX / tileWidth);
		var newTileViewTop = Math.floor(scrollY / tileHeight);
		var newTileViewWidth = Math.ceil((viewPortWidth + tileViewX) / tileWidth);
		var newTileViewHeight = Math.ceil((viewPortHeight + tileViewY) / tileHeight);

		if (tileViewX !== newTileViewX ||
			tileViewY !== newTileViewY) {
			tileViewX = newTileViewX;
			tileViewY = newTileViewY;
			mapViewPort.style.marginLeft = -tileViewX + 'px';
			mapViewPort.style.marginTop = -tileViewY + 'px';
		}

		if (tileViewTop !== newTileViewTop ||
			tileViewLeft !== newTileViewLeft ||
			tileViewWidth !== newTileViewWidth ||
			tileViewHeight !== newTileViewHeight) {

			tileViewTop = newTileViewTop;
			tileViewLeft = newTileViewLeft;
			tileViewWidth = newTileViewWidth;
			tileViewHeight = newTileViewHeight;

			for (var row = 0; row < newTileViewHeight; row++) {
				for (var col = 0; col < newTileViewWidth; col++) {

					var sIndex = (row + '.' + col);
					if (!tileCache.hasOwnProperty(sIndex)) {
						var tile = tileEl.cloneNode(false);
						tile.style.left = (tileWidth * col) + 'px';
						tile.style.top = (tileHeight * row) + 'px';
						tileCache[sIndex] = mapViewPort.appendChild(tile);
					}

					var className = mapData[tileViewTop + row][tileViewLeft + col];
					tileCache[sIndex].className = ('tile-' + className);


				}
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