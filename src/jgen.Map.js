/**
 * jGen - JavaScript Game Engine.
 * http://code.google.com/p/jgen/
 * Copyright (c) 2011 Ruslan Matveev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "Map",
		namespace: jgen
	},
	
	Map: function(eventQueue) {
		
		this.mapData = {};
		this.scrollX = 0;
		this.scrollY = 0;
		this.eventQueue = eventQueue;
		
		var viewPort = this.eventQueue.getViewPort();
		this.viewPort = viewPort.appendChild(
			jgen.HTML.setStyle(viewPort.ownerDocument.createElement('div'), {
				'position': 'absolute',
				'width': '100%',
				'height': '100%'
			})
		);
		this.tile = jgen.HTML.setStyle(this.viewPort.ownerDocument.createElement('div'), {
			'position': 'absolute',
			'background-image': 'url("tile.gif")',
			'background-repeat': 'no-repeat'
		});
	},
	
	setViewPortSize: function(viewPortWidth, viewPortHeight) {
		this.viewPortWidth = viewPortWidth;
		this.viewPortHeight = viewPortHeight;
	},
	
	setMapGeometry: function(mapWidth, mapHeight, tileWidth, tileHeight) {
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
		jgen.HTML.setStyle(this.tile, {
			'width': this.tileWidth + 'px',
			'height': this.tileHeight + 'px',
			'line-height': this.tileHeight + 'px'
		});
	},
	
	repaint: function() {
		if (this.repainting) return;
		this.repainting = true;
		this.eventQueue.addCallBack(this, function() {
			this.render();
			this.repainting = false;
		});
	},
	
	scrollTo: function(point) {
		var scrollX = point[0];
		var scrollY = point[1];
		
		/*
		scrollX = Math.min(
			Math.max(scrollX, 0),
			this.mapWidth * this.tileWidth - this.viewPortWidth
		);
		
		scrollY = Math.min(
			Math.max(scrollY, 0),
			this.mapHeight * this.tileHeight - this.viewPortHeight
		);
		*/
		
		if ((scrollX != this.scrollX) || (scrollY != this.scrollY)) {
			if (scrollY < 0) {
				window.top.status = scrollY;
			}
			this.scrollX = scrollX;
			this.scrollY = scrollY;
			this.repaint();
		}
	},
	
	scroll: function(rotation, distance) {
		this.scrollTo(jgen.Math.pointOfCircle(
			[this.scrollX, this.scrollY],
			rotation,
			distance
		));
	},
	
	render: function() {
		var scrollX = this.scrollX;
		var scrollY = this.scrollY;
		
		var xxx = (scrollX % this.tileWidth);
		var yyy = (scrollY % this.tileHeight);
		
		var iFromCell = Math.floor(scrollX / this.tileWidth);
		var iFromRow = Math.floor(scrollY / this.tileHeight);
		
		var iToCell = Math.ceil((this.viewPortWidth + xxx) / this.tileWidth);
		var iToRow = Math.ceil((this.viewPortHeight + yyy) / this.tileHeight);
		
		for (var row = 0; row < iToRow; row++) {
			for (var cell = 0; cell < iToCell; cell++) {
				
				var sIndex = [cell, row].join('.');
				var oTile = this.mapData[sIndex];
				if (!oTile) {
					var tilePosX = (this.tileWidth * cell);
					var tilePosY = (this.tileHeight * row);
					oTile = this.mapData[sIndex] = this.viewPort.appendChild(
						jgen.HTML.setStyle(this.tile.cloneNode(false), {
							'left': tilePosX + 'px',
							'top': tilePosY + 'px'
						}
					));
				}
				// update tile itself
				//oTile.innerHTML = [iFromCell + cell, iFromRow + row];
			}
		}
		
		this.viewPort.style.marginLeft = -xxx + 'px';
		this.viewPort.style.marginTop = -yyy + 'px';
		
	}
	
});
