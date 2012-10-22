var Sprite = Class(function() {

	var spriteEl = null;

	return {

		constructor: function(width, height) {
			spriteEl = document.createElement('div');
			spriteEl.style.opacity = 0.7;
			spriteEl.style.width = width + 'px';
			spriteEl.style.height = height + 'px';
			spriteEl.style.backgroundColor = 'red';
			spriteEl.style.position = 'absolute';
		},

		setPosition: function(x, y) {
			spriteEl.style.left = x + 'px';
			spriteEl.style.top = y + 'px';
		},

		getView: function() {
			return spriteEl;
		}

	};

});