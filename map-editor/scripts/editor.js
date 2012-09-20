var TEditor = Class.create({
	
	map: null,
	objects: {},
	selectedObject: null,
	
	constructor: function() {
		var oThis = this;
		document.addEventListener('mousedown', function(oEvent) {
			var oSender = oEvent.target;
			var oToolbarButton = oSender.queryAncestor('.toolbarButton');
			if (oToolbarButton) {
				if (oToolbarButton.hasClass('hideGrid')) {
					document.documentElement.addClass('hide-grid');
				} else if (oToolbarButton.hasClass('showGrid')) {
					document.documentElement.removeClass('hide-grid');
				}
			}
			var oLibraryItem = oSender.queryAncestor('.paletteItem');
			if (oLibraryItem) {
				if (!oLibraryItem.hasClass('selected')) {
					var oSelectedElement = oLibraryItem.parentNode.querySelector('.paletteItem.selected');
					if (oSelectedElement) oSelectedElement.removeClass('selected');
					oLibraryItem.addClass('selected');
					oThis.selectedObject = oThis.objects[oLibraryItem.category][oLibraryItem.name];
				} else {
					oLibraryItem.removeClass('selected');
					oThis.selectedObject = null;
				}
				return;
			}
			var oLibraryCategory = oSender.queryAncestor('.paletteCategoryName');
			if (oLibraryCategory) {
				var oCategory = oSender.queryAncestor('.paletteCategory');
				if (oCategory.queryMatches('.selected')) return;
				var oSelectedCategory = oCategory.parentNode.querySelector('.paletteCategory.selected');
				oSelectedCategory.removeClass('selected');
				oCategory.addClass('selected');
			}
		});
	},
	
	loadLibrary: function(sLibraryUrl, fCallBack) {
		var oThis = this;
		var oXMLHttpRequest = new XMLHttpRequest;
		oXMLHttpRequest.open("GET", sLibraryUrl, true);
		oXMLHttpRequest.onreadystatechange = function() {
			if (this.readyState != 4) return;
			var oDocument = this.responseXML;
			var aBaseURI = oDocument.baseURI.split('/');
			var sBaseURI = (aBaseURI.slice(0, aBaseURI.length - 1).join('/') + '/');
			oThis.parseLibrary(sBaseURI, this.responseXML, fCallBack);
		}
		oXMLHttpRequest.send(null);
	},
	
	parseLibrary: function(sBaseURI, oLibraryDocument, fCallBack) {
		var oThis = this;
		var iObjectsToLoad = 0;
		for (var oLibraryObjects = oLibraryDocument.evaluate(
			'category/object',
			oLibraryDocument.documentElement,
			null,
			XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
			null
		), i = 0; i < oLibraryObjects.snapshotLength; i++) {
			var oLibraryObject = oLibraryObjects.snapshotItem(i);
			new function() {
				iObjectsToLoad++;
				var sCategoryName = oLibraryObject.parentNode.getAttribute('name');
				var sObjectId = oLibraryObject.getAttribute('id');
				var sObjectUri = oLibraryObject.getAttribute('uri');
				var oObjectPreloader = document.createElement('img');
				oObjectPreloader.name = sObjectId;
				oObjectPreloader.onload = oObjectPreloader.onerror = function(oEvent) {
					if (!oThis.objects[sCategoryName]) oThis.objects[sCategoryName] = {};
					oThis.objects[sCategoryName][sObjectId] = oObjectPreloader;
					if (!--iObjectsToLoad) fCallBack.call(oThis);
				};
				oObjectPreloader.src = (sBaseURI + sObjectUri);
			}
		}
	},
	
	renderPalette: function(oElement) {
		var oPalette = oElement.ownerDocument.createElement('div');
		oPalette.className = 'palette';
		for (var sCategoryName in this.objects) {
			if (!oCategoryElement) {
				var oCategoryElement = oElement.ownerDocument.createElement('div');
				oCategoryElement.className = 'selected';
			} else oCategoryElement = oElement.ownerDocument.createElement('div');
			
			oCategoryElement.addClass('paletteCategory');
			
			var oCategoryNameElement = oElement.ownerDocument.createElement('div');
			oCategoryNameElement.className = 'paletteCategoryName';
			
			oCategoryNameElement.innerHTML = (sCategoryName + ' (' + Object.keys(this.objects[sCategoryName]).length + ')');
			oCategoryElement.appendChild(oCategoryNameElement);
		
			var oCategoryItemsElement = oElement.ownerDocument.createElement('div');
			oCategoryItemsElement.className = 'paletteCategoryItems';
			oCategoryElement.appendChild(oCategoryItemsElement);
			
			for (var sObjectId in this.objects[sCategoryName]) {
				var oObjectRef = this.objects[sCategoryName][sObjectId];
				var oPaletteItem = oElement.ownerDocument.createElement('div');
				oPaletteItem.className = 'paletteItem';
				oPaletteItem.name = sObjectId;
				oPaletteItem.category = sCategoryName;
				oPaletteItem.appendChild(
					oElement.ownerDocument.createElement('div').setStyle({
						'background-image': 'url("' + oObjectRef.src + '")'
					})
				);
				oCategoryItemsElement.appendChild(oPaletteItem);
			}
			
			oPalette.appendChild(oCategoryElement);
		}
		oElement.appendChild(oPalette);
	},
	
	drawGrid: function(iTileWidth, iTileHeight, sColor, oElement) {
		var oCanvas = document.createElement('canvas');
		var oContext = oCanvas.getContext("2d");
		oCanvas.setAttribute('width', iTileWidth);
		oCanvas.setAttribute('height', iTileHeight);
		oContext.strokeStyle = sColor;
		oContext.moveTo(iTileWidth / 2, 0);
		oContext.lineTo(0, iTileHeight / 2);
		oContext.lineTo(iTileWidth / 2, iTileHeight);
		oContext.lineTo(iTileWidth, iTileHeight / 2);
		oContext.lineTo(iTileWidth / 2, 0);
		oContext.stroke();
		oElement.setStyle({'background-image': 'url("'+oCanvas.toDataURL()+'")'});
	},
	
	renderWorkspace: function(oElement) {
		var iTileWidth = 64;
		var iTileHeight = 32;
		this.map = new TMap(oElement, oElement.offsetWidth, oElement.offsetHeight);
		this.map.initMap(iTileWidth, iTileHeight, 100, 100);
		this.drawGrid(iTileWidth, iTileHeight, '#CDCDCD', oElement);
	},
	
	loadMapData: function(sMapData) {
		var oThis = this;
		var oDOMParser = new DOMParser();
		var oMapData = oDOMParser.parseFromString(sMapData, "text/xml");
		this.map.processMap(oMapData.documentElement, function() {
			oThis.renderMap(0, 0);
		});
	},
	
	saveMapData: function() {
		var oXMLDocument = document.implementation.createDocument("", "map", null);
		var oDocumentElement = oXMLDocument.documentElement;
		oDocumentElement.setAttribute('tile-width', this.map.tileWidth);
		oDocumentElement.setAttribute('tile-height', this.map.tileHeight);
		oDocumentElement.setAttribute('map-width', this.map.mapWidthTiles);
		oDocumentElement.setAttribute('map-height', this.map.mapHeightTiles);
		
		var oTiles = {};
		var oTilesElement = oDocumentElement.appendChild(oXMLDocument.createElement('tiles'));
		var oMapElement = oDocumentElement.appendChild(oXMLDocument.createElement('map'));
		for (var sObjectKey in this.map.objects) {
			var sTileId = this.map.objects[sObjectKey];
			
			if (!oTiles[sTileId]) {
				oTiles[sTileId] = true;
				var oTileDefElement = oXMLDocument.createElement('tile');
				oTileDefElement.setAttribute('id', sTileId);
				oTileDefElement.setAttribute('uri', this.map.tiles[sTileId].tileUrl);
				oTilesElement.appendChild(oTileDefElement);
			}
			
			var aObjectPos = sObjectKey.split('.');
			var oTileElement = oXMLDocument.createElement('tile');
			oTileElement.setAttribute('refid', sTileId);
			oTileElement.setAttribute('x', aObjectPos[1]);
			oTileElement.setAttribute('y', aObjectPos[0]);
			oMapElement.appendChild(oTileElement);
		}
		
		return '<?xml version="1.0" encoding="UTF-8"?>\r\n' + (
			new XMLSerializer()
		).serializeToString(oXMLDocument);
	},
	
	renderMap: function(iScrollX, iScrollY) {
		this.map.render(iScrollX, iScrollY);
		
		var iGridX = iScrollX % this.map.tileWidth;
		iGridX = (iGridX >= 0 ? -iGridX : this.map.tileWidth - iGridX);
		
		var iGridY = iScrollY % this.map.tileHeight;
		iGridY = (iGridY >= 0 ? -iGridY : this.map.tileHeight - iGridY);
		
		this.map.viewPort.parentNode.setStyle({
			'background-position': iGridX + 'px ' + iGridY + 'px'
		});
	},
	
});
