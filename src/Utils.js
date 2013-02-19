define(function() {

	var DEG_TO_RAD = (180 / Math.PI);

	var CCASE_DASH = /([A-Z])/g;
	var URL_DIRNAME_REGEXP = /^(.*)\//;
	var URL_PARSER_REGEXP = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
	var CSS_URL_REGEXP = /^\s*url\(.*\)\s*$/i;

	var VENDOR_PREFIXES = {
		'webkit': true,
		'moz': true,
		'ms': true,
		'o': true
	};

	var CSS_NUM_PROPS = {
		'column-count': true,
		'fill-opacity': true,
		'font-weight': true,
		'line-height': true,
		'opacity': true,
		'orphans': true,
		'widows': true,
		'z-index': true,
		'zoom': true
	};

	var CSS_ARR_PROPS = {
		'background-position': true,
		'background-size': true
	};

	var last_generated_uid = 1;

	function cCaseToDash(value) {
		if (!isString(value)) return '';
		return value.replace(CCASE_DASH, function(all, letter) {
			return ('-' + letter.toLowerCase());
		});
	}

	function forEach(collection, callback) {
		var key;
		if (isArray(collection)) {
			for (key = 0; key < collection.length; key++) {
				callback(collection[key], key);
			}
		} else if (isMap(collection)) {
			for (key in collection) {
				callback(collection[key], key);
			}
		}
	}

	function removeDotSegments(path) {
		var path = path.split('/');
		var isAbsolute = (path[0] === '');
		var result = [], fragment = '';
		if (isAbsolute) path.shift();
		while (path.length) {
			fragment = path.shift();
			if (fragment === '..') {
				result.pop();
			} else if (fragment !== '.') {
				result.push(fragment);
			}
		}
		if (isAbsolute) result.unshift('');
		if (fragment === '.' || fragment === '..') result.push('');
		return result.join('/');
	}

	function isNumber(value) {
		return (typeof(value) === 'number' && !isNaN(value));
	}

	function isNumeric(value) {
		return (!isNaN(parseFloat(value)) && isFinite(value));
	}

	function isString(value) {
		return (typeof(value) === 'string');
	}

	function isArray(value) {
		return (value instanceof Array);
	}

	function isObject(value) {
		return (value instanceof Object);
	}

	function isMap(value) {
		return (value instanceof Object &&
			!(value instanceof Array));
	}

	function isDOMElement(value) {
		try {
			return value instanceof HTMLElement;
		} catch (exception) { return (
			typeof(value) === 'object' &&
			value.nodeType === 1
		); }
	}

	function rad2deg(angle) {
		return (angle * DEG_TO_RAD);
	}

	function deg2rad(angle) {
		return (angle / DEG_TO_RAD);
	}

	function parseURI(relURI) {
		var result = relURI.match(URL_PARSER_REGEXP);
		return {
			scheme: (result[1] || ''),
			authority: (result[2] || ''),
			path: (result[3] || ''),
			query: (result[4] || ''),
			fragment: (result[5] || '')
		};
	}

	function uniqueId(prefix) {
		if (!isString(prefix)) prefix = '';
		return (prefix + (last_generated_uid++));
	}

	function resolveURI(relURI, baseURI) {
		var relUri = parseURI(relURI);
		var baseUri = parseURI(baseURI);
		var res = '', ts = '';
		if (relUri.scheme) {
			res += (relUri.scheme + ':');
			if (ts = relUri.authority) res += ('//' + ts);
			if (ts = removeDotSegments(relUri.path)) res += ts;
			if (ts = relUri.query) res += ('?' + ts);
		} else {
			if (ts = baseUri.scheme) res += (ts + ':');
			if (ts = relUri.authority) {
				res += ('//' + ts);
				if (ts = removeDotSegments(relUri.path || '')) res += ts;
				if (ts = relUri.query) res += ('?' + ts);
			} else {
				if (ts = baseUri.authority) res += ('//' + ts);
				if (ts = relUri.path) {
					if (ts = removeDotSegments(ts.charAt(0) === '/' ? ts : (
						baseUri.authority && !baseUri.path ? '/' :
						(baseUri.path.match(URL_DIRNAME_REGEXP) || [''])[0]
					) + ts)) res += ts;
					if (ts = relUri.query) res += ('?' + ts);
				} else {
					if (ts = baseUri.path) res += ts;
					if ((ts = relUri.query) ||
						(ts = baseUri.query)) res += ('?' + ts);
				}
			}
		}
		if (ts = relUri.fragment) res += ('#' + ts);
		return res;
	}

	function generateCSS(targetEl, cssProps, namePrefix) {
		if (!isString(namePrefix)) namePrefix = '';
		var cssData = [], className, sPrefix, vendorPrefix;
		forEach(cssProps, function(classProps, className) {
			var propName, propValue;
			sPrefix = className[0];
			if (sPrefix === '#' || sPrefix === '.')
				className = className.substr(1);
			else sPrefix = '.';
			cssData.push(sPrefix + namePrefix + className + '{');
			if (isMap(classProps)) for (propName in classProps) {
				propValue = classProps[propName];
				propName = cCaseToDash(propName);
				vendorPrefix = propName.split('-')[0];
				if (VENDOR_PREFIXES[vendorPrefix] === true)
					propName = ('-' + propName);
				if (isNumeric(propValue) &&
					CSS_NUM_PROPS[propName] !== true) {
					propValue += 'px';
				} else if (isArray(propValue) &&
					CSS_ARR_PROPS[propName] === true) {
					for (var c = 0; c < propValue.length; c++) {
						if (isNumeric(propValue[c]))
							propValue[c] += 'px';
					}
					propValue = propValue.join(' ');
				}
				if (propName === 'background-image' &&
					!CSS_URL_REGEXP.test(propValue)) {
					propValue = 'url("' + propValue + '")';
				}
				if (isString(propValue) || isNumber(propValue))
					cssData.push(propName + ':' + propValue + ';');
			}
			cssData.push('}');
		});
		targetEl.innerHTML = cssData.join('');
	}

	function generateStyle() {
		var styleElement, elementID, elementCSS, namePrefix;
		var args = Array.prototype.slice.call(arguments);
		if (isString(args[0])) {
			elementID = args.shift();
			styleElement = document.getElementById(elementID);
		} else if (isDOMElement(args[0])) {
			styleElement = args.shift();
		}
		if (isObject(args[0])) elementCSS = args.shift();
		if (isString(args[0])) namePrefix = args.shift();
		if (!styleElement) {
			styleElement = document.createElement('style');
			styleElement.setAttribute('type', 'text/css');
			if (elementID) styleElement.id = elementID;
			document.head.appendChild(styleElement);
		}
		generateCSS(styleElement, elementCSS, namePrefix);
		return styleElement;
	}

	return {
		isNumber: isNumber,
		isNumeric: isNumeric,
		isString: isString,
		isArray: isArray,
		isMap: isMap,
		rad2deg: rad2deg,
		deg2rad: deg2rad,
		uniqueId: uniqueId,
		resolveURI: resolveURI,
		generateCSS: generateCSS,
		generateStyle: generateStyle
	};

});