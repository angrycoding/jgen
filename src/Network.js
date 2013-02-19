define(function() {

	var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject('Msxml2.XMLHTTP')},
		function () {return new ActiveXObject('Msxml3.XMLHTTP')},
		function () {return new ActiveXObject('Microsoft.XMLHTTP')}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var c = 0; c < XMLHttpFactories.length; c++) {
			try {
				xmlhttp = XMLHttpFactories[c]();
			} catch (e) { continue; }
			break;
		}
		return xmlhttp;
	}

	function doRequest(requestURI, success, fail) {
		var request = createXMLHTTPObject();
		if (!request) return fail();

		var postData = null;

		try {
			request.open('GET', requestURI, true);

			request.onreadystatechange = function() {
				if (request.readyState !== 4) return;
				var status = request.status;
				if (status > 399 && status < 600) return fail();
				success(request.responseText);
			};

			request.send(null);

		} catch (exception) { fail(); }
	}

	function removeCallback(callbackId) {
		delete window[callbackId];
		var scriptElement = document.getElementById(callbackId);
		scriptElement.parentNode.removeChild(scriptElement);
	}

	function doJSONPRequest(requestURI, success, fail, requestProps) {

		var requestQuery = [];
		var requestURI = Utils.uri.parse(requestURI);
		var requestParams = Utils.uri.parseQuery(requestURI.query);
		var callbackId = Utils.uniqueId('callback');
		requestParams.callback = callbackId;

		for (var paramName in requestParams) {
			if (requestParams.hasOwnProperty(paramName)) {
				requestQuery.push(paramName +
					'=' + requestParams[paramName]
				);
			}
		}

		requestURI = (
			(requestURI.scheme ? requestURI.scheme + '://' : '') +
			(requestURI.authority ? requestURI.authority : '') +
			(requestURI.path ? requestURI.path : '') +
			(requestQuery.length ? '?' + requestQuery.join('&') : '') +
			(requestURI.fragment ? '#' + requestURI.fragment : '')
		);

		var cleanup = removeCallback.bind(this, callbackId);

		window[callbackId] = function(response) {
			cleanup();
			success(response);
		};


		var scriptElement = document.createElement('script');
		scriptElement.setAttribute('id', callbackId);
		scriptElement.setAttribute('src', requestURI);
		scriptElement.setAttribute('type', 'text/javascript');

		scriptElement.onerror = function() {
			cleanup();
			fail();
		};

		// scriptElement.onerror =
		// scriptElement.onreadystatechange =
		// removeCallback.bind(this, callbackId);

		document.getElementsByTagName('head')[0].appendChild(scriptElement);
	}

	return function(requestURI, success, fail, requestProps, isJSONP) {
		if (!isJSONP) doRequest(requestURI, success, fail, requestProps);
		else doJSONPRequest(requestURI, success, fail, requestProps);
	};

});