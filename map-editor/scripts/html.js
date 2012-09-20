HTMLElement.prototype.setStyle = function(oStyle) {
	for (var sPropertyName in oStyle) {
		this.style[sPropertyName.camelize()] = oStyle[
			sPropertyName
		];
	}
	return this;
};

HTMLElement.prototype.queryAncestor = function(sSelector) {
	if (this.webkitMatchesSelector(sSelector)) return this;
	if ((this.parentNode) && (this.parentNode.nodeType == 1)) {
		return this.parentNode.queryAncestor(sSelector);
	}
	return null;
};

HTMLElement.prototype.queryMatches = function(sSelector) {
	return this.webkitMatchesSelector(sSelector);
};

HTMLElement.prototype.setClass = function(sClassName) {
	this.className = sClassName;
};

HTMLElement.prototype.hasClass = function(sClassName) {
	return new RegExp('(\\s|^)' + sClassName + '(\\s|$)').test(this.className);
};

HTMLElement.prototype.addClass = function(sClassName) {
	if (this.hasClass(sClassName)) return;
	this.className = (this.className + ' ' + sClassName);
};

HTMLElement.prototype.replaceClass = function(sFromClass, sToClass) {
	this.className = this.className.replace(
		new RegExp('(\\s|^)' + sFromClass + '(\\s|$)'),
		sToClass
	);
};

HTMLElement.prototype.removeClass = function(sClass) {
	this.replaceClass(sClass, '');
};
