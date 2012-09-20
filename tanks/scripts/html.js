HTMLElement.prototype.setStyle = function(oStyle) {
	for (var sPropertyName in oStyle) {
		this.style[sPropertyName.camelize()] = oStyle[
			sPropertyName
		];
	}
	return this;
};
