var Sprite = Class(function() {

	var spriteX = 0;
	var spriteY = 0;
	var spriteEl = null;

	function constructor(url, width, height) {
		spriteEl = document.createElement('div');
		spriteEl.style.position = 'absolute';
		spriteEl.style.width = width + 'px';
		spriteEl.style.height = height + 'px';
		spriteEl.style.backgroundColor = 'blue';
		// spriteEl.style.backgroundImage = 'url("' + url + '")';
	}

	function addFrame(frameID, frameX, frameY) {

	}

	function setPos(x, y) {
		spriteX = x;
		spriteY = y;
		spriteEl.style.left = x + 'px';
		spriteEl.style.top = y + 'px';
	}

	function getPos() {
		return [spriteX, spriteY];
	}

	function render(viewPort) {
		viewPort.appendChild(spriteEl);
	}

	return {
		constructor: constructor,
		addFrame: addFrame,
		setPos: setPos,
		getPos: getPos,
		render: render
	};

});