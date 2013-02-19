define([
	'./Constants'
], function(Constants) {

	var myApplyCache = {};

	function Sprite(spriteView, definition, factoryHandlers) {

		var frameNumber = 0;
		var frameBuffer = [];
		var instanceHandlers = {};

		var spriteLeft = 0, spriteTop = 0;
		var spriteWidth = definition.width;
		var spriteHeight = definition.height;
		var spriteFrames = definition.frames;
		var translateLeft = 0, translateTop = 0;

		var spriteProps = {};
		var spriteOpacity = 1;
		var spriteFrame = null;
		var spriteRotation = null;
		var spriteVisible = false;

		var updateOpacity = false;
		var updatePosition = false;
		var updateVisibility = false;
		var oldWalkState = Constants.ON_WALKSTOP;
		var newWalkState = Constants.ON_WALKSTOP;

		spriteView = spriteView.cloneNode(true);

		function handleEvent(id) {
			if (typeof id !== 'number') return;

			var args = [], length = arguments.length - 1;
			for (var c = 1; c <= length; c++) args.push(arguments[c]);

			var caller = myApplyCache[length];

			if (!caller) {
				var body = 'return c(';
				for (var c = 0; c < length; c++) {
					if (c) body += ',';
					body += 'a[' + c + ']';
				}
				body += ')';
				caller = new Function('c,a', body);
				myApplyCache[length] = caller;
			}

			var handlers = factoryHandlers[id];
			if (typeof handlers !== 'undefined' &&
				handlers.apply(this, args) === false) {
				return false;
			}

			handlers = instanceHandlers[id];
			if (typeof handlers !== 'undefined') {
				length = handlers.length;
				for (var c = 0; c < length; c++) {
					if (caller(handlers[c], args) === false) {
						return false;
					}
				}
			}

		}

		function view() {
			return spriteView;
		}

		function left() {
			return spriteLeft;
		}

		function right() {
			return spriteLeft + spriteWidth;
		}

		function top() {
			return spriteTop;
		}

		function bottom() {
			return spriteTop + spriteHeight;
		}

		function position() {
			return [spriteLeft, spriteTop];
		}

		function center() {
			return [
				spriteLeft + spriteWidth / 2,
				spriteTop + spriteHeight / 2
			];
		}

		function width() {
			return spriteWidth;
		}

		function height() {
			return spriteHeight;
		}

		function size() {
			return [spriteWidth, spriteHeight];
		}

		function rect() {
			return [
				spriteLeft, spriteTop,
				spriteWidth, spriteHeight
			];
		}

		function bound() {
			return [
				spriteLeft, spriteTop,
				spriteLeft + spriteWidth,
				spriteTop + spriteHeight
			];
		}

		function alpha(opacity) {
			if (spriteOpacity !== opacity) {
				spriteOpacity = opacity;
				updateOpacity = true;
			}
		}

		function show() {
			if (!spriteVisible) {
				spriteVisible = true;
				updateVisibility = true;
			}
		}

		function hide() {
			if (spriteVisible) {
				spriteVisible = false;
				updateVisibility = true;
			}
		}

		function visible() {
			return spriteVisible;
		}

		function rotation() {
			return spriteRotation;
		}

		function translate(left, top) {
			if (translateLeft !== left ||
				translateTop !== top) {
				translateLeft = left;
				translateTop = top;
				updatePosition = true;
			}
		}

		function rotate(rotation) {
			if (spriteRotation === rotation || handleEvent(
				Constants.ON_ROTATE, this, rotation) !== false) {
				spriteRotation = rotation;
				return true;
			} return false;
		}

		function move(left, top) {
			if (spriteLeft !== left ||
				spriteTop !== top) {

				if (handleEvent(
					Constants.ON_MOVE, this,
					spriteLeft, spriteTop,
					left, top
				) !== false) {

					spriteLeft = left;
					spriteTop = top;
					updatePosition = true;

					return true;

				}

				return false;

			}
			return true;
		}

		function walk(angle, speed) {
			if (this.rotate(angle) && this.move(
				spriteLeft + Math.cos(angle) * speed,
				spriteTop + Math.sin(angle) * speed)) {
				newWalkState = Constants.ON_WALKSTART;
				return true;
			} return false;
		}

		function getProperty(name) {
			return spriteProps[name];
		}

		function setProperty(name, value) {
			if (spriteProps[name] !== value) {
				spriteProps[name] = value;
				handleEvent(Constants.ON_PROPCHANGE, this, spriteProps);
			}
		}

		function setFrame(frame) {
			if (spriteFrame !== frame) {
				frameNumber = 0;
				frameBuffer = spriteFrames[
					spriteFrame = frame
				];
			}
		}

		function addEventListener(id, handler) {
			if (typeof id === 'number' &&
				handler instanceof Function) {
				if (!instanceHandlers[id]) instanceHandlers[id] = [];
				instanceHandlers[id].push(handler);
			}
		}

		function render() {

			if (oldWalkState !== newWalkState) {
				handleEvent(newWalkState, this);
				oldWalkState = newWalkState;
			} else newWalkState = Constants.ON_WALKSTOP;

			if (updateVisibility) {
				updateVisibility = false;
				if (spriteVisible) {
					spriteView.style.display = 'block';
				} else {
					spriteView.style.display = 'none';
				}
			}

			if (updateOpacity) {
				updateOpacity = false;
				spriteView.style.opacity = spriteOpacity;
			}

			if (updatePosition) {
				updatePosition = false;
				spriteView.style.left = (spriteLeft - translateLeft) + 'px';
				spriteView.style.top = (spriteTop - translateTop) + 'px';
			}

			if (frameBuffer.length) {
				spriteView.style.backgroundPosition = ('-' + (
					frameBuffer[Math.ceil(frameNumber)] ||
					frameBuffer[frameNumber = 0]
				).join('px -') + 'px');
				frameNumber += 1;
			}

		}

		return {
			view: view,
			left: left,
			right: right,
			top: top,
			bottom: bottom,
			position: position,
			center: center,
			width: width,
			height: height,
			size: size,
			rect: rect,
			bound: bound,
			visible: visible,
			rotation: rotation,

			move: move,
			show: show,
			hide: hide,
			walk: walk,
			alpha: alpha,
			rotate: rotate,
			render: render,
			setFrame: setFrame,
			translate: translate,
			getProperty: getProperty,
			setProperty: setProperty,
			addEventListener: addEventListener,

			// addSprite: addSprite
		};

	}

	return Sprite;

});