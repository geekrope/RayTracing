var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function GetDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}
function GetAngleBetweenLines(line1, line2) {
    var tan = (line2.k - line1.k) / (1 + line1.k * line2.k);
    return Math.atan(tan);
}
function RotatePointAroundAnotherPoint(center, point, angle) {
    var rotatedPoint = new DOMPoint(point.x, point.y);
    rotatedPoint.x -= center.x;
    rotatedPoint.y -= center.y;
    rotatedPoint.x = rotatedPoint.x * Math.cos(angle) - rotatedPoint.y * Math.sin(angle);
    rotatedPoint.y = rotatedPoint.x * Math.sin(angle) + rotatedPoint.y * Math.cos(angle);
    rotatedPoint.x += center.x;
    rotatedPoint.y += center.y;
    return rotatedPoint;
}
function DegToRad(angle) {
    return angle / Math.PI * 180;
}
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        if (p1 === void 0) { p1 = null; }
        if (p2 === void 0) { p2 = null; }
        this.x1 = Number.NEGATIVE_INFINITY;
        this.x2 = Number.POSITIVE_INFINITY;
        if (p1 && p2) {
            var line = this.RefreshLine(p1, p2);
            this.k = line.k;
            this.b = line.b;
        }
    }
    Line.prototype.XInDeterminantSpace = function (x) {
        var inDeterminantSpace = false;
        if (this.x1 == Number.NEGATIVE_INFINITY && isFinite(this.x2) && x < this.x2) {
            inDeterminantSpace = true;
        }
        else if (this.x2 == Number.POSITIVE_INFINITY && isFinite(this.x1) && x > this.x1) {
            inDeterminantSpace = true;
        }
        else if (isFinite(this.x2) && isFinite(this.x1) && x > this.x1 && x < this.x2) {
            inDeterminantSpace = true;
        }
        else if (this.x1 == Number.NEGATIVE_INFINITY && this.x2 == Number.POSITIVE_INFINITY) {
            inDeterminantSpace = true;
        }
        else {
            inDeterminantSpace = false;
        }
        return inDeterminantSpace;
    };
    Line.prototype.RefreshLine = function (p1, p2) {
        var line = new Line();
        var translatedP2 = new DOMPoint(p2.x - p1.x, p2.y - p1.y);
        line.k = translatedP2.y / translatedP2.x;
        line.b = p2.y - p2.x * line.k;
        return line;
    };
    Line.CreateLineByK = function (p1, k) {
        var line = new Line();
        line.k = k;
        line.b = p1.y - p1.x * k;
        return line;
    };
    Line.CreateLineByB = function (b) {
        var line = new Line();
        line.b = b;
        line.k = 0;
        return line;
    };
    Line.prototype.GetPoint = function (x) {
        return new DOMPoint(x, x * this.k + this.b);
    };
    Line.prototype.GetIntersection = function (line) {
        var x = (line.b - this.b) / (this.k - line.k);
        if (line.k == this.k) {
            //lines are parallel
            return null;
        }
        if (this.XInDeterminantSpace(x) && line.XInDeterminantSpace(x)) {
            return this.GetPoint(x);
        }
        return null;
    };
    Line.prototype.GetNormal = function (point) {
        var newK = -1 / this.k;
        return Line.CreateLineByK(point, newK);
    };
    Line.prototype.GetRotatedLine = function (angle, x) {
        var center = this.GetPoint(x);
        //var x0Point = this.GetPoint(0);
        //var rotatedPoint = RotatePointAroundAnotherPoint(center, x0Point, angle);
        var k = (Math.tan(angle) + this.k) / (1 - Math.tan(angle) * this.k);
        //new Line(rotatedPoint, center)
        var rotatedLine = Line.CreateLineByK(center, k);
        return rotatedLine;
    };
    return Line;
}());
var Ray = /** @class */ (function () {
    function Ray(startPoint, directionPoint) {
        this.line = new Line();
        this.startPoint = startPoint;
        this.directionPoint = directionPoint;
        this.RebuildRay();
    }
    Object.defineProperty(Ray.prototype, "StartPoint", {
        get: function () {
            return this.startPoint;
        },
        set: function (value) {
            this.startPoint = value;
            this.RebuildRay();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ray.prototype, "DirectionPoint", {
        get: function () {
            return this.directionPoint;
        },
        set: function (value) {
            this.directionPoint = value;
            this.RebuildRay();
        },
        enumerable: false,
        configurable: true
    });
    Ray.prototype.RebuildRay = function () {
        this.line = this.line.RefreshLine(this.startPoint, this.directionPoint);
        if (this.startPoint.x > this.directionPoint.x) {
            this.line.x1 = Number.MIN_VALUE;
            this.line.x2 = this.startPoint.x;
        }
        else {
            this.line.x2 = Number.MAX_VALUE;
            this.line.x1 = this.startPoint.x;
        }
    };
    Ray.prototype.GetIntersecion = function (element) {
        return new Line(element.Point1, element.Point2).GetIntersection(this.line);
    };
    Object.defineProperty(Ray.prototype, "Line", {
        get: function () {
            return this.line;
        },
        enumerable: false,
        configurable: true
    });
    return Ray;
}());
var ProcessedRay = /** @class */ (function () {
    function ProcessedRay(ray) {
        this.Closed = false;
        this.RefractionPoints = [ray.StartPoint, ray.DirectionPoint];
    }
    return ProcessedRay;
}());
var OpticalElement = /** @class */ (function () {
    function OpticalElement(point1, point2) {
        this.line = new Line();
        this.point1 = point1;
        this.point2 = point2;
        this.RebuildOpticalElement();
    }
    OpticalElement.prototype.RebuildOpticalElement = function () {
        this.line = this.line.RefreshLine(this.point1, this.point2);
        this.line.x1 = Math.min(this.point1.x, this.point2.x);
        this.line.x2 = Math.max(this.point1.x, this.point2.x);
    };
    Object.defineProperty(OpticalElement.prototype, "Point1", {
        get: function () {
            return this.point1;
        },
        set: function (value) {
            this.point1 = value;
            this.RebuildOpticalElement();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpticalElement.prototype, "Point2", {
        get: function () {
            return this.point2;
        },
        set: function (value) {
            this.point2 = value;
            this.RebuildOpticalElement();
        },
        enumerable: false,
        configurable: true
    });
    OpticalElement.prototype.GetProcessedRay = function (ray) {
        return null;
    };
    return OpticalElement;
}());
var Mirror = /** @class */ (function (_super) {
    __extends(Mirror, _super);
    function Mirror(point1, point2) {
        return _super.call(this, point1, point2) || this;
    }
    Mirror.prototype.GetProcessedRay = function (ray) {
        var intersection = ray.GetIntersecion(this);
        if (intersection) {
            var normal = this.line.GetNormal(intersection);
            var angle = GetAngleBetweenLines(normal, ray.Line);
            var reflectedLine = normal.GetRotatedLine(-angle, intersection.x);
            if (reflectedLine.k < 0) {
                return [new Ray(intersection, normal.GetPoint(0)), new Ray(intersection, reflectedLine.GetPoint(0))];
            }
            else {
                return [new Ray(intersection, normal.GetPoint(screen.width)), new Ray(intersection, reflectedLine.GetPoint(screen.width))];
            }
        }
        return null;
    };
    return Mirror;
}(OpticalElement));
//# sourceMappingURL=maths.js.map