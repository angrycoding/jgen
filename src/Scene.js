define([
	'./Utils',
	'./Constants',
], function(Utils, Constants) {

	return function(
		mapWidth, mapHeight,
		tileWidth, tileHeight,
		flatData, layersCount,

		target,
		viewPortWidth, viewPortHeight,
		scaleToFit
	) {


		var locations = {};


		var instanceID = Utils.uniqueId();

		var viewPort = document.createElement('div');
		viewPort.style.position = 'absolute';

		if (scaleToFit) {

			var scaleX = (viewPortWidth / (tileWidth * mapWidth));
			var scaleY = (viewPortHeight / (tileHeight * mapHeight));


			viewPortWidth = tileWidth * mapWidth;
			viewPortHeight = tileHeight * mapHeight;


			viewPort.style.webkitTransformOrigin = '0px 0px';
			viewPort.style.webkitTransform = 'scale(' + scaleX + ',' + scaleY + ')';

			viewPort.style.transformOrigin = '0px 0px';
			viewPort.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
		}



		viewPort.style.width = viewPortWidth + 'px';
		viewPort.style.height = viewPortHeight + 'px';
		viewPort.style.overflow = 'hidden';
		viewPort.className = 'jgen-viewport';

		var tileViewPort = document.createElement('div');
		tileViewPort.id = ('jgen-tiles-' + instanceID);
		tileViewPort.style.position = 'absolute';
		viewPort.appendChild(tileViewPort);




		var tileElement = document.createElement('div');
		tileElement.style.width = tileWidth + 'px';
		tileElement.style.height = tileHeight + 'px';

		var spriteViewPort = document.createElement('div');
		spriteViewPort.style.position = 'absolute';
		viewPort.appendChild(spriteViewPort);

		target.appendChild(viewPort);



		var spriteRefs = [], spritesCount = 0;
		var tileCache = {}, mapArea = mapWidth * mapHeight;
		var scrollLeft, scrollTop, scrollRight, scrollBottom;
		var marginLeft, marginTop, tileX, tileY, tileW, tileH;
		var maxScrollLeft = Math.max(0, tileWidth * mapWidth - viewPortWidth);
		var maxScrollTop = Math.max(0, tileHeight * mapHeight - viewPortHeight);

		function isSpriteOnScreen(sprite) {
			var spriteBound = sprite.bound();
			return !(
				spriteBound[0] > scrollRight ||
				spriteBound[1] > scrollBottom ||
				spriteBound[2] < scrollLeft ||
				spriteBound[3] < scrollTop
			);
		}

		function translate(left, top) {

			scrollLeft = Math.max(0, Math.min(left, maxScrollLeft));
			scrollTop = Math.max(0, Math.min(top, maxScrollTop));
			scrollRight = scrollLeft + viewPortWidth;
			scrollBottom = scrollTop + viewPortHeight;

			tileX = Math.floor(scrollLeft / tileWidth);
			tileY = Math.floor(scrollTop / tileHeight);
			marginLeft = (scrollLeft % tileWidth);
			marginTop = (scrollTop % tileHeight);
			tileW = Math.ceil((viewPortWidth + marginLeft) / tileWidth);
			tileH = Math.ceil((viewPortHeight + marginTop) / tileHeight);

			for (var spriteRef, c = 0; c < spritesCount; c++) {
				spriteRef = spriteRefs[c];
				// if (isSpriteOnScreen(spriteRef = spriteRefs[c])) {
					spriteRef.translate(scrollLeft, scrollTop);
					// if (!spriteRef.attached) {
						// spriteRef.attached = true;
						// spriteViewPort.appendChild(spriteRef.view());
					// }
				// } else if (spriteRef.attached) {
					// spriteRef.attached = false;
					// spriteViewPort.removeChild(spriteRef.view());
				// }
			}

		}

		function render() {

			var layerOffset, rowOffset1, rowOffset2;
			var layer, row, col, tile, tileID, cacheKey;

			var region;

			tileViewPort.style.left = -marginLeft + 'px';
			tileViewPort.style.top = -marginTop + 'px';

			for (layer = 0; layer < layersCount; layer++) {
				layerOffset = layer * mapArea;
				for (row = 0; row < tileH; row++) {
					rowOffset1 = rowOffset2 = layerOffset;
					rowOffset1 += (tileY + row) * mapHeight + tileX;
					rowOffset2 += row * mapHeight;
					for (col = 0; col < tileW; col++) {
						tileID = flatData[rowOffset1 + col];
						if (tile = tileCache[cacheKey = rowOffset2 + col]) {
							if (tile[1] !== tileID) {
								tile[0].className = tile[1] = tileID;
							}
						} else {
							tile = tileElement.cloneNode(false);
							tile.style.zIndex = (layer * 2);
							tile.className = tileID;
							tile.style.left = (tileWidth * col) + 'px';
							tile.style.top = (tileHeight * row) + 'px';
							tileViewPort.appendChild(tile);
							tileCache[cacheKey] = [tile, tileID];
						}
					}
				}
			}

			for (var spriteRef, c = 0; c < spritesCount; c++) {
				spriteRef = spriteRefs[c];
				// if (spriteRef.attached) {
					spriteRef.render();
				// }
			}

		}

		function onSpriteMove(sprite, ox, oy, nx, ny) {

			var w = sprite.width();
			var h = sprite.height();
			var sIndex = sprite.getProperty('index');

			var fromX = Math.floor(ox / tileWidth);
			var fromY = Math.floor(oy / tileHeight);
			var toX = Math.floor((ox + w) / tileWidth);
			var toY = Math.floor((oy + h) / tileHeight);

			for (var y = fromY; y <= toY; y++) {
				for (var x = fromX; x <= toX; x++) {
					var cIndex = (y * mapWidth + x);
					if (!locations[cIndex]) continue;
					delete locations[cIndex][sIndex];
				}
			}

			fromX = Math.floor(nx / tileWidth);
			fromY = Math.floor(ny / tileHeight);
			toX = Math.floor((nx + w) / tileWidth);
			toY = Math.floor((ny + h) / tileHeight);


			var collidesWith = {};

			for (var y = fromY; y <= toY; y++) {
				for (var x = fromX; x <= toX; x++) {
					var cIndex = (y * mapWidth + x);

					// if (cIndex === 122) return false;
					if (!locations[cIndex]) locations[cIndex] = {};
					for (var sIndex2 in locations[cIndex]) {
						if (sIndex !== sIndex2) {
							collidesWith[sIndex2] = true;
						}
					}
					locations[cIndex][sIndex] = true;
				}
			}


			for (var sIndex2 in collidesWith) {
				var f = spriteRefs[sIndex2].center();
				var distance = Math.sqrt(
					Math.pow(f[0] - (nx + w / 2), 2) +
					Math.pow(f[1] - (ny + h / 2), 2)
				);
				if (distance < 54) {
					console.info('COLLISION:', distance);
					return false;
				}
			}




			return true;
		}

		function addSprite(sprite) {

			spritesCount = spriteRefs.push(sprite);

			var spriteView = sprite.view();
			spriteViewPort.appendChild(spriteView);

			sprite.setProperty('index', String(spritesCount - 1));
			sprite.addEventListener(Constants.ON_MOVE, onSpriteMove);


			onSpriteMove(
				sprite,
				sprite.left(),
				sprite.top(),
				sprite.left(),
				sprite.top()
			);

		}

		function addSprites() {
			var sprites = Array.prototype.slice.call(arguments);
			for (var c = 0; c < sprites.length; c++) {
				var sprite = sprites[c];
				if (sprite instanceof Array) {
					addSprites.apply(this, sprite);
				} else addSprite(sprite);
			}
		}

		translate(0, 0);

		return {
			addSprite: addSprites,
			translate: translate,
			render: render
		};

	};

});