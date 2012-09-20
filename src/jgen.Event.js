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
		name: "Event",
		namespace: jgen,
		singleton: true
	},
	
	add: {
		"Object, String, Function": function(oElement, sEventType, fEventHandler) {
			oElement.addEventListener(sEventType, fEventHandler);
		},
		"Object, Object, Function": function(oElement, oEventType, fEventHandler) {
			var oThis = this;
			var sEventType = sEventSelector = '';
			for (var sKey in oEventType) {
				sEventType = sKey;
				sEventSelector = oEventType[sEventType];
				break;
			}
			(function(sEventSelector) {
				oThis.add(oElement, sEventType, function(oEvent) {
					var oSender = oEvent.target;
					if (jgen.Selector.queryAncestor(oSender, sEventSelector)) {
						fEventHandler.call(oSender, oEvent);
					}
				});
			})(sEventSelector);
		}
	}
	
});
