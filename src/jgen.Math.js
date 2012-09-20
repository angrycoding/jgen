/**
 * jGen - JavaScript Game Engine.
 * http://code.google.com/p/jgen/
 * Copyright (c) 2011 Ruslan Matveev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

jsface.namespace("jgen");

jsface.def({
	
	$meta: {
		name: "Math",
		namespace: jgen,
		singleton: true
	},
	
	DEG_TO_RAD: (180 / Math.PI),
	
	rad2deg: function(angle) {
		return (angle * this.DEG_TO_RAD);
	},
	
	deg2rad: function(angle) {
		return (angle / this.DEG_TO_RAD);
	},
	
	random: function(min, max) {
		return Math.round(min + (Math.random() * (max - min)));
	},
	
	point2distance: function(point1, point2) {
		return Math.sqrt(
			Math.pow(point2[0] - point1[0], 2) +
			Math.pow(point2[1] - point1[1], 2)
		);
	},
	
	point2angle: function(point1, point2) {
		return Math.atan2(
			point2[1] - point1[1],
			point2[0] - point1[0]
		);
	},
	
	pointOfCircle: function(point, angle, radius) {
		return [
			point[0] + Math.cos(angle) * radius,
			point[1] + Math.sin(angle) * radius
		];
	},
	
	pointOfLine: function(point1, point2, distance) {
		return jgen.Math.pointOfCircle(
			point1, jgen.Math.point2angle(
				point1,
				point2
			), distance
		);
	},
	
	pointInRect: [
		function(aPosition, aSize, aPoint) {
			return (
				(aPoint[0] >= aPosition[0]) &&
				(aPoint[1] >= aPosition[1]) &&
				(aPoint[0] < aPosition[0] + aSize[0]) &&
				(aPoint[1] < aPosition[0] + aSize[1])
			);
		},
		function(pos, size, angle, point) {
			var iHalfWidth = (size[0] * 0.5);
			var iHalfHeight = (size[1] * 0.5);
			var aRectCenter = [pos[0] + iHalfWidth, pos[1] + iHalfHeight];
			
			var p2 = jgen.Math.pointOfCircle(
				[iHalfWidth, iHalfHeight],
				jgen.Math.point2angle(aRectCenter, point) - angle,
				jgen.Math.point2distance(aRectCenter, point)
			);
			
			return (
				(p2[0] >= 0 && p2[1] >= 0) &&
				(p2[0] < size[0] && p2[1] < size[1])
			);
		}
	],
	
	
	
	
	pointsOfRect: [
		function(aPosition, aSize) {
			var aRectTopRight, aRectBottomLeft;
			return [
				aPosition,
				aRectTopRight = [aPosition[0] + aSize[0], aPosition[1]],
				aRectBottomLeft = [aPosition[0], aPosition[1] + aSize[1]],
				[aRectTopRight[0], aRectBottomLeft[1]]
			];
		},
		function(aPosition, aSize, iRotation) {
			var aRectCenter = [aPosition[0] + aSize[0] * 0.5, aPosition[1] + aSize[1] * 0.5];
			var iHalfCircle = jgen.Math.deg2rad(180);
			var iVertexDistance = jgen.Math.point2distance(aRectCenter, aPosition);
			var iBRVertexAngle = iRotation + Math.atan2(-aSize[1], aSize[0]);
			var iTRVertexAngle = iRotation + Math.atan2(aSize[1], aSize[0])
			return [
				jgen.Math.pointOfCircle(aRectCenter, iTRVertexAngle + iHalfCircle, iVertexDistance),
				jgen.Math.pointOfCircle(aRectCenter, iBRVertexAngle, iVertexDistance),
				jgen.Math.pointOfCircle(aRectCenter, iTRVertexAngle, iVertexDistance),
				jgen.Math.pointOfCircle(aRectCenter, iBRVertexAngle + iHalfCircle, iVertexDistance),
			];
		}
	],
	
	
	
	
	
	
	
	lineOnLine: [
		function(iX1, iY1, iX2, iY2, iX3, iY3, iX4, iY4) {
			var iDelta = (iX1 - iX2) * (iY3 - iY4) - (iY1 - iY2) * (iX3 - iX4);
			if (!iDelta) return [];
			var iPre = (iX1 * iY2 - iY1 * iX2);
			var iPost = (iX3 * iY4 - iY3 * iX4);
			var iPointX = (iPre * (iX3 - iX4) - (iX1 - iX2) * iPost) / iDelta;
			var iPointY = (iPre * (iY3 - iY4) - (iY1 - iY2) * iPost) / iDelta;
			if ((iPointX < Math.min(iX1, iX2) || iPointX > Math.max(iX1, iX2) ||
				iPointX < Math.min(iX3, iX4) || iPointX > Math.max(iX3, iX4)) ||
				(iPointY < Math.min(iY1, iY2) || iPointY > Math.max(iY1, iY2) ||
				iPointY < Math.min(iY3, iY4) || iPointY > Math.max(iY3, iY4))) return [];
			return [iPointX, iPointY];
		}
	],
	
	rectangles: function(r1p1x, r1p1y, r1p2x, r1p2y,
            				r1p3x, r1p3y, r1p4x, r1p4y,
            				r2p1x, r2p1y, r2p2x, r2p2y,
            				r2p3x, r2p3y, r2p4x, r2p4y) {
            if(!jgen.Math.isProjectedAxisCollision(r1p1x, r1p1y, r1p2x, r1p2y, 
                r2p1x, r2p1y, r2p2x, r2p2y, r2p3x, r2p3y, r2p4x, r2p4y))
                return false;
            
            if(!jgen.Math.isProjectedAxisCollision(r1p2x, r1p2y, r1p3x, r1p3y, 
                r2p1x, r2p1y, r2p2x, r2p2y, r2p3x, r2p3y, r2p4x, r2p4y))
                return false;
            
            if(!jgen.Math.isProjectedAxisCollision(r2p1x, r2p1y, r2p2x, r2p2y, 
                r1p1x, r1p1y, r1p2x, r1p2y, r1p3x, r1p3y, r1p4x, r1p4y))
                return false;
            
            if(!jgen.Math.isProjectedAxisCollision(r2p2x, r2p2y, r2p3x, r2p3y, 
                r1p1x, r1p1y, r1p2x, r1p2y, r1p3x, r1p3y, r1p4x, r1p4y))
                return false;
            
            return true;
        },
        
        isProjectedAxisCollision: function(b1x, b1y, b2x, b2y, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
            var x1, x2, x3, x4;
            var y1, y2, y3, y4;
            if(b1x == b2x)
            {
                x1 = x2 = x3 = x4 = b1x;
                y1 = p1y;
                y2 = p2y;
                y3 = p3y;
                y4 = p4y;
                
                if(b1y > b2y)
                {
                    if((y1 > b1y && y2 > b1y && y3 > b1y && y4 > b1y) || 
                       (y1 < b2y && y2 < b2y && y3 < b2y && y4 < b2y))
                        return false;
                }
                else
                {
                    if((y1 > b2y && y2 > b2y && y3 > b2y && y4 > b2y) ||
                       (y1 < b1y && y2 < b1y && y3 < b1y && y4 < b1y))
                        return false;
                }
                return true;
            }
            else if(b1y == b2y)
            {
                x1 = p1x;
                x2 = p2x;
                x3 = p3x;
                x4 = p4x;
                y1 = y2 = y3 = y4 = b1y;
            }
            else
            {
                var a = (b1y - b2y) / (b1x - b2x);
                var ia = 1 / a;
                var t1 = b2x * a - b2y;
                var t2 = 1 / (a + ia);
                
                x1 = (p1y + t1 + p1x * ia) * t2;
                x2 = (p2y + t1 + p2x * ia) * t2;
                x3 = (p3y + t1 + p3x * ia) * t2;
                x4 = (p4y + t1 + p4x * ia) * t2;
                
                y1 = p1y + (p1x - x1) * ia;
                y2 = p2y + (p2x - x2) * ia;
                y3 = p3y + (p3x - x3) * ia;
                y4 = p4y + (p4x - x4) * ia;
            }
            
            if(b1x > b2x)
            {
                if((x1 > b1x && x2 > b1x && x3 > b1x && x4 > b1x) ||
                   (x1 < b2x && x2 < b2x && x3 < b2x && x4 < b2x))
                    return false;
            }
            else
            {
                if((x1 > b2x && x2 > b2x && x3 > b2x && x4 > b2x) ||
                   (x1 < b1x && x2 < b1x && x3 < b1x && x4 < b1x))
                    return false;
            }
            return true;
        },
        
});
