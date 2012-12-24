var Sprite = (function() {

	var sprite = document.createElement('div');
	sprite.style.display = 'none';
	sprite.style.position = 'absolute';
	sprite.style.backgroundPosition = '0px 0px';
	sprite.style.backgroundRepeat = 'no-repeat';

	return function(width, height, url, states, handlers, cManager) {

		var frameNumber = 0;
		var frameBuffer = [];

		var spriteX = 0;
		var spriteY = 0;
		var spriteState = {};
		var spriteFrame = null;
		var spriteRotation = null;
		var spriteVisible = false;

		var frameChanged = false;
		var stateChanged = false;
		var rotationChanged = false;
		var positionChanged = false;
		var visibilityChanged = false;

		var spriteEl = sprite.cloneNode(true);
		spriteEl.style.width = width + 'px';
		spriteEl.style.height = height + 'px';
		spriteEl.style.backgroundImage = 'url("'+url+'")';

		if (!(handlers instanceof Object) ||
			handlers instanceof Array) {
			handlers = {};
		}

		var onRotate = handlers.onRotate;
		if (!onRotate instanceof Function) onRotate = null;

		var onStateChange = handlers.onStateChange;
		if (!onStateChange instanceof Function) onStateChange = null;

		function setPosition(x, y) {
			var collision = cManager.adjust(x, y, width, height);

			if (collision) {

				if (instance.y + height <= collision[1]) {
					y = collision[1] - height;
				} else if (instance.y >= collision[1] + collision[3]) {
					y = collision[1] + collision[3];
				}

				if (instance.x + width <= collision[0]) {
					x = collision[0] - width;
				} else if (instance.x >= collision[0] + collision[2]) {
					x = collision[0] + collision[2];
				}
			}

			var isMoved = (instance.x !== x || instance.y !== y);

			instance.x = x;
			instance.y = y;


			return isMoved;
		}

		return {

			getView: function() {
				return spriteEl;
			},

			getPosition: function() {
				return [spriteX, spriteY];
			},

			getCenter: function() {
				return [
					spriteX + width / 2,
					spriteY + height / 2
				];
			},

			getWidth: function() {
				return width;
			},

			getHeight: function() {
				return height;
			},

			move: function(x, y) {
				if (spriteX !== x ||
					spriteY !== y) {
					spriteX = x;
					spriteY = y;
					positionChanged = true;
				}
				return true;
			},

			show: function() {
				if (!spriteVisible) {
					spriteVisible = true;
					visibilityChanged = true;
				}
			},

			hide: function() {
				if (spriteVisible) {
					spriteVisible = false;
					visibilityChanged = true;
				}
			},

			rotate: function(rotation) {
				if (spriteRotation !== rotation) {
					spriteRotation = rotation;
					rotationChanged = true;
				}
			},

			walk: function(angle, speed) {
				this.rotate(angle);
				return this.move(
					spriteX + Math.cos(angle) * speed,
					spriteY + Math.sin(angle) * speed
				);
			},

			setState: function(state, value) {
				if (spriteState[state] !== value) {
					spriteState[state] = value;
					stateChanged = true;
				}
			},

			setFrame: function(frame) {
				if (spriteFrame !== frame) {
					frameNumber = 0;
					spriteFrame = frame;
					frameChanged = true;
				}
			},

			render: function(scrollX, scrollY) {

				if (visibilityChanged) {
					visibilityChanged = false;
					if (spriteVisible) {
						spriteEl.style.display = 'block';
					} else spriteEl.style.display = 'none';
				}

				if (rotationChanged) {
					rotationChanged = false;
					if (onRotate) {
						onRotate.call(
							this,
							spriteRotation
						);
					}
				}

				if (stateChanged) {
					stateChanged = false;
					if (onStateChange) {
						onStateChange.call(
							this,
							spriteState
						);
					}
				}

				if (frameChanged) {
					frameChanged = false;
					frameBuffer = states[spriteFrame];
				}

				if (positionChanged) {
					positionChanged = false;
					// spriteEl.style.webkitTransform = 'translate(' + (spriteX - scrollX || 0) + 'px,' + (spriteY - scrollY || 0) + 'px)';
					spriteEl.style.left = (spriteX - scrollX || 0) + 'px';
					spriteEl.style.top = (spriteY - scrollY || 0) + 'px';
				}

				// spriteEl.style.zIndex = spriteY;
				spriteEl.style.backgroundPosition = ('-' + (
					frameBuffer[frameNumber] ||
					frameBuffer[frameNumber = 0]
				).join('px -') + 'px');

				frameNumber++;

			}

		};

	};

})();