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
		name: "HTML",
		namespace: jgen,
		singleton: true
	},
	
	setStyle: function(oElement, oStyle) {
		for (var sPropertyName in oStyle) {
			oElement.style[jgen.String.camelize(sPropertyName)] = oStyle[
				sPropertyName
			];
		}
		return oElement;
	},
	
	setClass: {
		"Object, String": function(oElement, sClassName) {
			oElement.className = sClassName;
		},
		"Object, Array": function(oElement, aClassNames) {
			oElement.className = aClassNames.join(' ');
		}
	},
	
	hasClass: {
		"Object, String": function(oElement, sClassName) {
			return new RegExp('(\\s|^)' + sClassName + '(\\s|$)').test(
				oElement.className
			);
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				if (!this.hasClass(oElement, aClassNames[c])) {
					return false;
				}
			}
			return true;
		}
	},
	
	addClass: {
		"Object, String": function(oElement, sClassName) {
			if (this.hasClass(oElement, sClassName)) return;
			oElement.className = (oElement.className + ' ' + sClassName);
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				this.addClass(oElement, aClassNames[c]);
			}
		}
	},
	
	replaceClass: {
		"Object, String, String": function(oElement, sFromClass, sToClass) {
			oElement.className = jgen.String.trim(
				oElement.className.replace(
					new RegExp('(\\s|^)' + sFromClass + '(\\s|$)'),
					' ' + sToClass + ' '
				)
			);
		},
		"Object, Object": function(oElement, oReplaceHash) {
			for (var sFromClass in oReplaceHash) {
				this.replaceClass(
					oElement,
					sFromClass,
					oReplaceHash[sFromClass]
				);
			}
		}
	},
	
	removeClass: {
		"Object, String": function(oElement, sClassName) {
			this.replaceClass(oElement, sClassName, '');
		},
		"Object, Array": function(oElement, aClassNames) {
			for (var c = 0; c < aClassNames.length; c++) {
				this.replaceClass(oElement, aClassNames[c], '');
			}
		}
	}
	
});
