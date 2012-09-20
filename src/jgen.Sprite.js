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
		name: "Sprite",
		namespace: jgen,
		foo: 120
	},
	
	spriteFrame: 0,
	spriteVisible: false,
	spriteWidth: 0,
	spriteHeight: 0,
	spriteLeft: 0,
	spriteTop: 0,
	rotationBase: 0,
	spriteRotation: 0,
	spriteFrames: [],
	spriteElement: null,
	
	Sprite: function(eventQueue, sUrl, iWidth, iHeight) {
		this.eventQueue = eventQueue;
		this.spriteFrames = [];
		this.spriteWidth = iWidth;
		this.spriteHeight = iHeight;
		var oViewPort = this.eventQueue.getViewPort();
		if (oViewPort) {
			this.spriteElement = oViewPort.appendChild(jgen.HTML.setStyle(
				oViewPort.ownerDocument.createElement('div'), {
					'display': 'none',
					'position': 'absolute',
					'width': iWidth + 'px',
					'height': iHeight + 'px',
					'background-image': 'url("' + sUrl + '")',
					'background-repeat': 'no-repeat',
					'background-position': '0px 0px',
					'-webkit-origin': (
						(this.spriteWidth / 2) + 'px ' +
						(this.spriteHeight / 2) + 'px'
					)
				}
			));
		}
	},
	
	clone: function() {
		var oClone = new this.constructor(this.eventQueue);
		jsface.inherit(oClone, this);
		oClone.spriteElement = this.spriteElement.parentNode.appendChild(
			this.spriteElement.cloneNode(true)
		);
		return oClone;
	},
	
	destroy: function() {
		var oSpriteElement = this.spriteElement;
		this.spriteElement = null;
		oSpriteElement.parentNode.removeChild(oSpriteElement);
	},
	
	addFrame: function(iLayerLeft, iLayerTop) {
		return this.spriteFrames.push([-iLayerLeft, -iLayerTop]);
	},
	
	setFrame: function(iFrameNumber, iFrameTo) {
		if (this.spriteFrame != iFrameNumber) {
			var aFramePos = this.spriteFrames[this.spriteFrame = iFrameNumber];
			this.eventQueue.addEvent(this.spriteElement, {
				'background-position': aFramePos[0] + 'px ' + aFramePos[1] + 'px'
			});
		}
	},
	
	animateFrames: function(iFrom, iTo, iSkipFrames, fCallBack) {
		var oThis = this;
		this.setFrame(iFrom);
		this.eventQueue.addCallBack(this, function() {
			if (iFrom != iTo) {
				window.top.status = iFrom;
				this.animateFrames(iFrom + 1, iTo, iSkipFrames, fCallBack);
			} else if (fCallBack) fCallBack.call(this);
		}, iSkipFrames); 
	},
	
	animate: function(iFrom, iTo, iSkipFrames, fCallBack) {
		var oThis = this;
		if (!this.animating) {
			this.animating = true;
			
			if ((this.spriteFrame < iFrom) || (this.spriteFrame >= iTo)) this.spriteFrame = iFrom;
			this.setFrame(this.spriteFrame + 1);
			
			this.eventQueue.addCallBack(this, function() {
				oThis.animating = false;
				this.eventQueue.addCallBack(this, function() {
					if ((!oThis.animating) && (fCallBack)) fCallBack.call(oThis);
				}, iSkipFrames);
			}, iSkipFrames);
		}
	},
	
	
	
	
	
	
	
	
	setVisible: function(bVisible) {
		if (this.spriteVisible != bVisible) {
			this.eventQueue.addEvent(this.spriteElement, {
				'display': (this.spriteVisible = bVisible ? 'block' : 'none')
			});
		}
	},
	
	setRotationBase: function(iAngle) {
		this.rotationBase = iAngle;
	},
	
	setRotation: function(iAngle) {
		if (this.spriteRotation != iAngle) {
			this.eventQueue.addEvent(this.spriteElement, {
				'-webkit-transform': 'rotate(' + (
					this.spriteRotation = (iAngle + this.rotationBase)
				) + 'rad)'
			});
		}
	},
	
	rotate: function(iAngle) {
		this.setRotation(this.spriteRotation + iAngle);
	},
	
	setPosition: [
		function(iLeft, iTop) {
			if ((this.spriteLeft != iLeft) || (this.spriteTop != iTop)) {
				this.eventQueue.addEvent(this.spriteElement, {
					'left': (this.spriteLeft = iLeft) + 'px',
					'top': (this.spriteTop = iTop) + 'px'
				});
			}
		},
		function(aPoint) {
			this.setPosition(aPoint[0], aPoint[1]);
		}
	],
	
	getPosition: function() {
		return [this.spriteLeft, this.spriteTop];
	},
	
	moveForward: function(iDistance) {
		this.setPosition(jgen.Math.pointOfCircle(
			[this.spriteLeft, this.spriteTop],
			this.spriteRotation, iDistance
		));
	},
	
	animateMove: function(iToX, iToY, fCallBack) {
		var oThis = this;
		this.moveForward(8);
		if ((oThis.spriteLeft <= iToX) && (oThis.spriteTop <= iToY)) {
			setTimeout(function() {
				oThis.animateMove(iToX, iToY, fCallBack);
			}, 0);
		} else if (fCallBack) fCallBack.call(this); 
	}
	
});
