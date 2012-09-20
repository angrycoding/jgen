var TMap = Class.create({
	
	viewPort: null,
	viewPortBuffer: null,
	viewPortWidthPx: 0,
	viewPortHeightPx: 0,
	viewPortWidthTiles: 0,
	viewPortHeightTiles: 0,
	
	tileWidth: 0,
	tileHeight: 0,
	tileHalfWidth: 0,
	tileHalfHeight: 0,
	mapWidthTiles: 0,
	mapHeightTiles: 0,
	
	tiles: {},
	sprites: {},
	objects: {},
	mapData: {},
	spritesViewPort: null,
	
	constructor: function(oViewPort, iViewPortWidth, iViewPortHeight) {
		var oViewPortElement = oViewPort.ownerDocument.createElement('div').setStyle({
			'position': 'absolute',
			'width': '100%',
			'height': '100%'
		});
		this.viewPort = oViewPort.appendChild(oViewPortElement);
		this.spritesViewPort = oViewPort.appendChild(oViewPortElement.cloneNode(true));
		this.viewPortBuffer = document.createDocumentFragment();
		this.initViewPort(iViewPortWidth, iViewPortHeight);
	},
	
	initMap: function(iTileWidth, iTileHeight, iMapWidth, iMapHeight) {
		this.tileWidth = iTileWidth;
		this.tileHeight = iTileHeight;
		this.tileHalfWidth = (this.tileWidth / 2);
		this.tileHalfHeight = (this.tileHeight / 2);
		this.mapWidthTiles = iMapWidth;
		this.mapHeightTiles = iMapHeight;
		this.initViewPort(this.viewPortWidthPx, this.viewPortHeightPx);
	},
	
	initViewPort: function(iViewPortWidth, iViewPortHeight) {
		this.viewPortWidthPx = iViewPortWidth;
		this.viewPortHeightPx = iViewPortHeight;
		this.viewPortWidthTiles = Math.ceil(this.viewPortWidthPx / this.tileWidth);
		this.viewPortHeightTiles = Math.ceil(this.viewPortHeightPx / this.tileHeight * 2);
	},
	
	loadMap: function(sMapUrl, fCallBack) {
		var oThis = this;
		var oXMLHttpRequest = new XMLHttpRequest;
		oXMLHttpRequest.open("GET", sMapUrl, true);
		oXMLHttpRequest.onreadystatechange = function() {
			if (this.readyState != 4) return;
			oThis.processMap(this.responseXML.documentElement, fCallBack);
		}
		oXMLHttpRequest.send(null);
	},
	
	processMap: function(oMapData, fCallBack) {
		var oThis = this;
		
		this.initMap(
			parseInt(oMapData.getAttribute('tile-width'), 10),
			parseInt(oMapData.getAttribute('tile-height'), 10),
			parseInt(oMapData.getAttribute('map-width'), 10),
			parseInt(oMapData.getAttribute('map-height'), 10)
		);
		
		var aCSSData = [];
		this.createTiles(oMapData, aCSSData, function() {
			//this.createSprites(oMapData, aCSSData, function() {
				
				var oOwnerDocument = this.viewPort.ownerDocument;
				var oHead = oOwnerDocument.getElementsByTagName('head')[0];
				var oStyle = oOwnerDocument.createElement('style');
				oStyle.setAttribute('type', 'text/css');
				oStyle.innerText = aCSSData.join(' ');
				oHead.appendChild(oStyle);
				
				this.createMap(oMapData);
				fCallBack.call(oThis);
			//});
		});
	},
	
	createTile: function(sTileUri, iTileWidth, iTileHeight) {
		var oTile = this.viewPort.ownerDocument.createElement('div').setStyle({
			'position': 'absolute',
			'width': (iTileWidth + 'px'),
			'height': (iTileHeight + 'px'),
			'background-image': 'url("' + sTileUri + '")',
			'margin-top': (this.tileHeight - iTileHeight) + 'px',
			'margin-left': ((this.tileWidth - iTileWidth) / 2) + 'px',
			'background-repeat': 'no-repeat',
			'background-position': 'center center'
		});
		oTile.tileUrl = sTileUri;
		return oTile;
	},
	
	createTiles: function(oMapData, aCSSData, fCallBack) {
		var oThis = this;
		var oMapDocument = oMapData.ownerDocument;
		var oViewPortDocument = this.viewPort.ownerDocument;
		var iLoading = 0;
		var aTiles = oMapDocument.evaluate('tiles/tile', oMapData, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var i = 0; i < aTiles.snapshotLength; i++, iLoading++) {
			var oTile = aTiles.snapshotItem(i);
			new function() {
				var sTileId = oTile.getAttribute('id');
				var sTileUri = oTile.getAttribute('uri');
				var oImage = oViewPortDocument.createElement('img');
				oImage.onload = oImage.onerror = function() {
					aCSSData.push(['.' +  sTileId + '{',
						('position:absolute;'),
						('width:' + this.width + 'px;'),
						('height:' + this.height + 'px;'),
						('background-image:url("' + sTileUri + '");'),
						('margin-top:' + (oThis.tileHeight - this.height) + 'px;'),
						('margin-left:' + (oThis.tileWidth - this.width) / 2 + 'px;'),
						('background-repeat:no-repeat;'),
						('background-position:center center;'),
					'}'].join(''));
					if (!--iLoading) fCallBack.call(oThis);
				};
				oImage.src = sTileUri;
				oThis.tiles[sTileId] = oViewPortDocument.createElement('div');
				oThis.tiles[sTileId].tileUrl = sTileUri;
				oThis.tiles[sTileId].className = sTileId;
			}
		}
	},
	
	createSprites: function(oMapData, aCSSData, fCallBack) {
		var oMapDocument = oMapData.ownerDocument;
		var oViewPortDocument = this.viewPort.ownerDocument;
		var aSprites = oMapDocument.evaluate('sprites/sprite', oMapData, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var i = 0; i < aSprites.snapshotLength; i++) {
			var oSprite = aSprites.snapshotItem(i);
			var sSpriteId = oSprite.getAttribute('id');
			var sSpriteUri = oSprite.getAttribute('uri');
			var sSpriteWidth = oSprite.getAttribute('width');
			var sSpriteHeight = oSprite.getAttribute('height');
			aCSSData.push(['.' +  sSpriteId + '{',
				('position:absolute;'),
				('width:' + sSpriteWidth + 'px;'),
				('height:' + sSpriteHeight + 'px;'),
				('background-image:url("' + sSpriteUri + '");'),
				('background-repeat:no-repeat;'),
			'}'].join(''));
			var aLayers = oMapDocument.evaluate('layer', oSprite, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
			for (var j = 0; j < aLayers.snapshotLength; j++) {
				var oLayer = aLayers.snapshotItem(j);
				var sLayerName = oLayer.getAttribute('name');
				var sFrames = oLayer.getAttribute('frames');
				var aFrames = sFrames.split(';');
				for (var c = 0;  c < aFrames.length; c++) {
					var aFrame = aFrames[c].split(',');
					var iFrameLeft = parseInt(aFrame[0], 10);
					var iFrameTop = parseInt(aFrame[1], 10);
					aCSSData.push(['.' +  sSpriteId + '.' + sLayerName + '-' + c + '{',
						('background-position: -' + iFrameLeft + 'px -' + iFrameTop + 'px;'),
					'}'].join(''));
				}
			}
			this.sprites[sSpriteId] = oViewPortDocument.createElement('div');
			this.sprites[sSpriteId].className = sSpriteId;
		}
		fCallBack.call(this);
	},
	
	createMap: function(oMapData) {
		var oMapDocument = oMapData.ownerDocument;
		var oMapObjects = oMapDocument.evaluate('map/*', oMapData, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var i = 0; i < oMapObjects.snapshotLength; i++) {
			var oMapObject = oMapObjects.snapshotItem(i);
			var sRefId = oMapObject.getAttribute('refid');
			var iMapPosX = parseInt(oMapObject.getAttribute('x'), 10);
			var iMapPosY = parseInt(oMapObject.getAttribute('y'), 10);
			var sTagName = oMapObject.tagName.toLowerCase();
			if (sTagName == 'tile') {
				this.objects[iMapPosY + '.' + iMapPosX] = sRefId;
			} else if (sTagName == 'sprite') {
				/*
				var iSpriteRotate = parseInt(oMapObject.getAttribute('rotate'), 10);
				var sSpriteClass = oMapObject.getAttribute('class');
				if (!sSpriteClass) sSpriteClass = 'TSprite';
				var oSpriteClass = (eval(sSpriteClass));
				var oSprite = this.addSprite(new oSpriteClass(this, 'sprite sprite-' + sRefId));
				var aSpritePos = this.map2screen(iMapPosX, iMapPosY);
				aSpritePos[0] -= 16;
				aSpritePos[1] -= 16;
				oSprite.move(aSpritePos[0], aSpritePos[1]);
				if (iSpriteRotate) oSprite.rotate(iSpriteRotate);
				oSprite.show();
				*/
			}
		}
	},
	
	clearViewPort: function() {
		var oViewPort = this.viewPort.cloneNode(false);
		this.viewPort.parentNode.replaceChild(oViewPort, this.viewPort);
		this.viewPort = oViewPort;
	},
	
	screen2map: function(clientX, clientY, iScrollX, iScrollY) {
		var sx = clientX + iScrollX;  
		var sy = clientY + iScrollY;
		var xmouseA = Math.round(sx / this.tileWidth + sy / this.tileHeight);
		var ymouseA = Math.round(-sx / this.tileWidth + sy / this.tileHeight);
		var iRow = (xmouseA + ymouseA);
		var iCell = Math.round(iRow % 2 ?
			(sx - this.tileHeight) / this.tileWidth :
			(sx / this.tileWidth)
		);
		return [iCell, iRow];
	},
	
	map2screen: function(iCell, iRow) {
		var x = (iCell * this.tileWidth);
		var y = (iRow * this.tileHalfHeight);
		if (iRow % 2 != 0) x = (iCell * this.tileWidth) + this.tileHalfWidth;
		y -= this.tileHalfHeight;
		return [x, y];
	},
	
	addSprite: function(oSprite) {
		this.sprites.push(oSprite);
		oSprite.sprite = this.spritesViewPort.appendChild(
			this.spritesViewPort.ownerDocument.importNode(
				oSprite.sprite,
				true
			)
		);
		return oSprite;
	},
	
	removeSprite: function(oSprite) {
		for (var c = 0; c < this.sprites.length; c++) {
			if (this.sprites[c] == oSprite) {
				this.sprites.splice(c, 1);
				oSprite.sprite.parentNode.removeChild(oSprite.sprite);
				break;
			}
		}
	},
	
	isColliding: function(oSprite, x, y) {
		for (var c = 0; c < this.sprites.length; c++) {
			if (this.sprites[c] != oSprite) {
				var oTargetSprite = this.sprites[c];
				var iTargetDistance = Math.ceil(Math.point_distance(
					(x + oSprite.sprite.offsetWidth / 2),
					(y + oSprite.sprite.offsetHeight / 2),
					(oTargetSprite.posX + oTargetSprite.sprite.offsetWidth / 2),
					(oTargetSprite.posY + oTargetSprite.sprite.offsetHeight / 2)
				));
				if (iTargetDistance < 30) {
					oSprite.onCollide(oTargetSprite);
					return true;
				}
			}
		}
	},
	
	calcViewPort: function(iScrollX, iScrollY) {
		return {
			fromRow: Math.ceil(iScrollY / this.tileHalfHeight) - 1,
			toRow: Math.ceil((iScrollY + this.viewPortHeightPx) / this.tileHalfHeight) + 1,
			fromCellEven: Math.round(iScrollX / this.tileWidth),
			toCellEven: Math.round((iScrollX + this.viewPortWidthPx) / this.tileWidth) + 1,
			fromCellOdd: Math.round((iScrollX - this.tileHalfWidth) / this.tileWidth),
			toCellOdd: Math.round((iScrollX + this.viewPortWidthPx + this.tileHalfWidth) / this.tileWidth)
		};
	},
	
	render: function(iScrollX, iScrollY) {
		var oNewMapRect = this.calcViewPort(iScrollX, iScrollY);
		
		var iFromRow = oNewMapRect.fromRow;
		var iToRow = oNewMapRect.toRow;
		
		var iTileOffsetX = (this.tileHalfWidth + iScrollX);
		var iTileOffsetY = (this.tileHalfHeight + iScrollY);
		
		var oFragment = this.viewPortBuffer.cloneNode(false);
		
		var iAccessTime = Math.random();
		
		for (var iRow = iFromRow; iRow < iToRow; iRow++) {
			if (iRow % 2) {
				var iOffset = this.tileHalfWidth;
				var iFromCell = oNewMapRect.fromCellOdd;
				var iToCell = oNewMapRect.toCellOdd;
			} else {
				var iOffset = 0;
				var iFromCell = oNewMapRect.fromCellEven;
				var iToCell = oNewMapRect.toCellEven;
			}
			var iTileTop = (this.tileHeight * iRow - this.tileHalfHeight * iRow) - iTileOffsetY;
			for (var iCell = iFromCell; iCell < iToCell; iCell++) {
				var sIndex = (iRow + '.' + iCell);
				var oTile = this.mapData[sIndex];
				if ((!oTile) && (this.objects[sIndex]) && (this.tiles[this.objects[sIndex]])) {
					var iTileLeft = (this.tileWidth * iCell + iOffset) - iTileOffsetX;
					oTile = this.mapData[sIndex] = oFragment.appendChild(
						this.tiles[this.objects[sIndex]].cloneNode(false).setStyle({
							'left': iTileLeft + iScrollX + 'px',
							'top': iTileTop + iScrollY + 'px',
							'z-index': iRow
						})
					);
				}
				if (oTile) oTile.accessTime = iAccessTime;
			}
		}
		
		this.viewPort.style.marginLeft = -iScrollX + 'px';
		this.viewPort.style.marginTop = -iScrollY + 'px';
		
		for (var key in this.mapData) {
			if (this.mapData[key].accessTime != iAccessTime) {
				var oTile = this.mapData[key];
				oTile.parentNode.removeChild(oTile);
				delete(this.mapData[key]);
			}
		}
		
		this.viewPort.appendChild(oFragment);
	}
	
});
