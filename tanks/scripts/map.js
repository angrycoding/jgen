var TSprite = Class.create({
	map: null,
	sprite: null,
	posX: 0,
	posY: 0,
	rotationDeg: 0,
	rotationRad: 0,
	constructor: function(oMapRef, sClassName) {
		this.map = oMapRef;
		this.sprite = document.createElement('div');
		this.sprite.setStyle({'display': 'none'});
		this.sprite.className = sClassName;
	},
	onCollide: function() {},
	onOffScreen: function() {},
	rotate: function(iAngleDeg) {
		if (iAngleDeg == this.rotationDeg) return;
		this.rotationDeg = iAngleDeg;
		if (this.rotationDeg < 0) this.rotationDeg = 360;
		if (this.rotationDeg > 360) this.rotationDeg = 0;
		this.rotationRad = Math.deg2rad(this.rotationDeg);
		this.sprite.setStyle({
			'webkit-transform': 'rotate(' + this.rotationDeg + 'deg)'
		});
	},
	rotateTo: function(iAngleDeg) {
		this.rotate(this.rotationDeg + iAngleDeg);
	},
	move: function(x, y) {
		
		if ((this.posX == x) && (this.posY == y)) return;
		
		if (this.map.isColliding(this, x, y)) {
			if (this.map.isColliding(this, this.posX, y)) {
				if (!this.map.isColliding(this, x, this.posY)) this.posX = x;
			} else this.posY = y;
		} else {
			this.posX = x;
			this.posY = y;
		}
		
		if (this.posX < 0) this.onOffScreen();
		if (this.posY < 0) this.onOffScreen();
		if (this.posX > this.map.viewPort.offsetWidth) this.onOffScreen();
		if (this.posY > this.map.viewPort.offsetHeight) this.onOffScreen();
		
		this.sprite.setStyle({
			'left': this.posX + 'px',
			'top': this.posY + 'px'
		});
		
	},
	moveTo: function(x, y) {
		this.move(
			this.posX + x,
			this.posY + y
		);
	},
	moveForward: function(px) {
		this.moveTo(
			-Math.sin(this.rotationRad) * px,
			Math.cos(this.rotationRad) * px
		);
	},
	show: function() {
		this.sprite.setStyle({'display': 'block'});
	}
});

var TBullet = Class.create(TSprite, {
	show: function() {
		this.base();
		var oThis = this;
		this.moving = setInterval(function() {
			oThis.moveForward(4);
		}, 0);
	},
	onOffScreen: function() {
		clearInterval(this.moving);
		this.map.removeSprite(this);
	},
	onCollide: function(oSprite) {
		clearInterval(this.moving);
		this.map.removeSprite(oSprite);
		this.map.removeSprite(this);
	}
});

var TMap = Class.create({
	
	viewPort: null,
	viewPortBuffer: null,
	viewPortWidthPx: 0,
	viewPortHeightPx: 0,
	viewPortWidthTiles: 0,
	viewPortHeightTiles: 0,
	
	tile: null,
	tileWidth: 0,
	tileHeight: 0,
	tileHalfWidth: 0,
	tileHalfHeight: 0,
	
	mapWidthTiles: 0,
	mapHeightTiles: 0,
	
	sprites: [],
	spritesViewPort: null,
	
	constructor: function(oViewPort, iViewPortWidth, iViewPortHeight) {
		var oViewPortElement = oViewPort.ownerDocument.createElement('div').setStyle({
			'position': 'absolute',
			'width': '100%',
			'height': '100%'
		});
		this.viewPort = oViewPort.appendChild(oViewPortElement);
		this.spritesViewPort = oViewPort.appendChild(oViewPortElement.cloneNode(true));
		this.viewPortWidthPx = iViewPortWidth;
		this.viewPortHeightPx = iViewPortHeight;
		this.viewPortBuffer = document.createDocumentFragment();
	},
	
	loadMap: function(sMapUrl, fCallBack) {
		var oThis = this;
		var oXMLHttpRequest = new XMLHttpRequest;
		oXMLHttpRequest.open("GET", sMapUrl, true);
		oXMLHttpRequest.onreadystatechange = function() {
			if (this.readyState != XMLHttpRequest.DONE) return;
			oThis.processMap(this.responseXML.documentElement);
			fCallBack.call(oThis);
		}
		oXMLHttpRequest.send(null);
	},
	
	processMap: function(oMapData) {
		this.tileWidth = parseInt(oMapData.getAttribute('tile-width'), 10);
		this.tileHeight = parseInt(oMapData.getAttribute('tile-height'), 10);
		
		this.tileHalfWidth = (this.tileWidth / 2);
		this.tileHalfHeight = (this.tileHeight / 2);
		this.viewPortWidthTiles = Math.ceil(this.viewPortWidthPx / this.tileWidth);
		this.viewPortHeightTiles = Math.ceil(this.viewPortHeightPx / this.tileHeight * 2);
		this.mapWidthTiles = parseInt(oMapData.getAttribute('map-width'), 10);
		this.mapHeightTiles = parseInt(oMapData.getAttribute('map-height'), 10);
		
		var aCSSRules = [];
		
		var aMapDefinition = oMapData.getElementsByTagName('map');
		for (var i = 0; i < aMapDefinition.length; i++) {
			var aMapDefinitions = aMapDefinition[i].getElementsByTagName('*');
			for (var j = 0; j < aMapDefinitions.length; j++) {
				var oMapDefinition = aMapDefinitions[j];
				if (oMapDefinition.tagName.toLowerCase() == 'sprite') {
					var sSpriteRef = oMapDefinition.getAttribute('ref');
					var iSpritePosX = parseInt(oMapDefinition.getAttribute('x'), 10);
					var iSpritePosY = parseInt(oMapDefinition.getAttribute('y'), 10);
					var iSpriteRotate = parseInt(oMapDefinition.getAttribute('rotate'), 10);
					var sSpriteClass = oMapDefinition.getAttribute('class');
					if (!sSpriteClass) sSpriteClass = 'TSprite';
					var oSpriteClass = (eval(sSpriteClass));
					var oSprite = this.addSprite(new oSpriteClass(this, 'sprite-' + sSpriteRef));
					oSprite.move(iSpritePosX, iSpritePosY);
					if (iSpriteRotate) oSprite.rotate(iSpriteRotate);
					oSprite.show();
				}
			}
		}
		
		var aSpriteDefinition = oMapData.getElementsByTagName('sprites');
		for (var i = 0; i < aSpriteDefinition.length; i++) {
			var aSpriteDefinitions = aSpriteDefinition[i].getElementsByTagName('sprite');
			for (var j = 0; j < aSpriteDefinitions.length; j++) {
				var oSpriteDefinition = aSpriteDefinitions[j];
				var sSpriteName = oSpriteDefinition.getAttribute('name');
				var sSpriteUrl = oSpriteDefinition.getAttribute('url');
				var sSpriteStyle = oSpriteDefinition.getAttribute('style');
				var iSpriteWidth = parseInt(oSpriteDefinition.getAttribute('width'), 10);
				var iSpriteHeight = parseInt(oSpriteDefinition.getAttribute('height'), 10);
				aCSSRules.push('.sprite-' + sSpriteName + '{' +
					'position:absolute;' +
					'width:' + iSpriteWidth + 'px;' +
					'height:' + iSpriteHeight + 'px;' +
					(sSpriteUrl ? 'background-image:url("' + sSpriteUrl + '");' : '') +
					(sSpriteStyle ? sSpriteStyle : '') +
				'}');
			}
		}
		
		var aTileDefinition = oMapData.getElementsByTagName('tiles');
		for (var i = 0; i < aTileDefinition.length; i++) {
			var aTileDefinitions = aTileDefinition[i].getElementsByTagName('tile');
			for (var j = 0; j < aTileDefinitions.length; j++) {
				var oTileDefinition = aTileDefinitions[j];
				var sTileName = oTileDefinition.getAttribute('name');
				var sTileUrl = oTileDefinition.getAttribute('url');
				var iTileWidth = parseInt(oTileDefinition.getAttribute('width'), 10);
				var iTileHeight = parseInt(oTileDefinition.getAttribute('height'), 10);
				if (!iTileWidth) iTileWidth = this.tileWidth;
				if (!iTileHeight) iTileHeight = this.tileHeight;
				aCSSRules.push('.tile-' + sTileName + '{' +
					'position:absolute;' +
					'background-repeat:no-repeat;' +
					'background-position:center top;' +
					'width:' + iTileWidth + 'px;' +
					'height:' + iTileHeight + 'px;' +
					'background-image:url("' + sTileUrl + '");' +
				'}');
			}
		}
		
		var oOwnerDocument = this.viewPort.ownerDocument;
		var oHead = oOwnerDocument.getElementsByTagName('head')[0];
		var oStyle = oOwnerDocument.createElement('style');
		oStyle.setAttribute('type', 'text/css');
		oStyle.innerText += aCSSRules.join('');
		oHead.appendChild(oStyle);
		
		this.tile = document.createElement('div');
		this.tile.className = 'tile-grass1';
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
	
	clearViewPort: function() {
		var oViewPort = this.viewPort.cloneNode(false);
		this.viewPort.parentNode.replaceChild(oViewPort, this.viewPort);
		this.viewPort = oViewPort;
	},
	
	screen2Map: function(clientX, clientY, iScrollX, iScrollY) {
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
	
	addSprite: function(oSprite) {
		this.sprites.push(oSprite);
		oSprite.sprite = this.spritesViewPort.appendChild(
			this.spritesViewPort.ownerDocument.importNode(
				oSprite.sprite
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
	
	render: function(iScrollX, iScrollY) {
		var oNewMapRect = this.calcViewPort(iScrollX, iScrollY);
		var oFragment = this.viewPortBuffer.cloneNode(false);
		var iFromRow = oNewMapRect.fromRow;
		var iToRow = oNewMapRect.toRow;
		var iTileOffsetX = (this.tileHalfWidth + iScrollX);
		var iTileOffsetY = (this.tileHalfHeight + iScrollY);
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
				var iTileLeft = (this.tileWidth * iCell + iOffset) - iTileOffsetX;
				var oTile = this.tile.cloneNode(false);
				oTile.style.left = iTileLeft + 'px';
				oTile.style.top = iTileTop + 'px';
				oFragment.appendChild(oTile);
			}
		}
		this.spritesViewPort.style.marginLeft = -iScrollX + this.viewPortWidthPx / 2 + 'px';
		this.spritesViewPort.style.marginTop = -iScrollY + this.viewPortHeightPx / 2 + 'px';
		this.clearViewPort();
		this.viewPort.appendChild(oFragment);
	}
});
