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
		name: "EventQueue",
		namespace: jgen
	},

	events: [],
	keys: {},
	mouse: {},

	EventQueue: function(viewPort) {
		this.viewPort = viewPort;
	},

	getViewPort: function() {
		return this.viewPort;
	},

	start: function(fCallBack, iDelay) {
		var oThis = this;
		document.addEventListener('keydown', function(oEvent) {
			oThis.keys[oEvent.keyCode] = true;
		});
		document.addEventListener('keyup', function(oEvent) {
			oThis.keys[oEvent.keyCode] = false;
		});
		document.addEventListener('mousemove', function(oEvent) {
			oThis.mouse.x = oEvent.pageX;
			oThis.mouse.y = oEvent.pageY;
		});
		setInterval(function() { fCallBack.call(oThis); }, 0);
	},

	addCallBack: function(oSender, fCallBack, iSkipFrames) {
		this.events.push([oSender, fCallBack, iSkipFrames ? iSkipFrames : 0, ]);
	},

	addEvent: function(oSender, oProperties) {
		this.events.push([oSender, function() {
			jgen.HTML.setStyle(this, oProperties);
		}, 0]);
	},

	processEvents: function() {
		for (var iLength = this.events.length, c = 0; c < iLength; c++) {
			var oEvent = this.events[c];
			if (oEvent[2] > 0) {
				oEvent[2]--;
				this.events.push(oEvent);
			} else oEvent[1].call(oEvent[0]);
		}
		this.events.splice(0, iLength);
	}

});
