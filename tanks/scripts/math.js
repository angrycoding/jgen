Math.DEG_TO_RAD = (180 / Math.PI);

Math.rad2deg = function(iRad) {
	return (iRad * this.DEG_TO_RAD);
}

Math.deg2rad = function(iDeg) {
	return (iDeg / this.DEG_TO_RAD);
}

Math.point_distance = function(x1, y1, x2, y2) {
	return Math.sqrt(
		Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
	);
}

Math.point_direction = function(x1, y1, x2, y2) {
	return Math.atan2(
		y1 - y2,
		x2 - x1
	);
}

Math.circle_point = function(x, y, angle, radius) {
	return [
		x + radius * Math.cos(angle),
		y + radius * Math.sin(angle)
	];
}
