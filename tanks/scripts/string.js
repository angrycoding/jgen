String.prototype.camelize = function() {
	for (var str = '', c = 0; c < this.length; c++) {
		if (this[c] != '-') str += (this[c - 1] == '-' ?
			this[c].toUpperCase() :
			this[c]
		);
	}
	return str;
};
