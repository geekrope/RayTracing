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
    return 0;
}
function GetAngleBetweenLineAndHorizon(line1, y) {
    var horizon = Line.CreateLineByB(y);
    var intersection = horizon.GetIntersection(line1);
    if (!intersection) {
        return Math.PI;
    }
    else {
        var x0Point = line1.GetPoint(0);
        var dist = GetDistance(new DOMPoint(0, 0), x0Point);
        var angle = Math.acos((x0Point.x - intersection.x) / dist);
        return angle;
    }
}
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        if (p1 === void 0) { p1 = null; }
        if (p2 === void 0) { p2 = null; }
        this.x1 = Number.MIN_VALUE;
        this.x2 = Number.MAX_VALUE;
        if (p1 && p2) {
            var line = this.RefreshLine(p1, p2);
            this.k = line.k;
            this.b = line.b;
        }
    }
    Line.prototype.RefreshLine = function (p1, p2) {
        var line = new Line();
        var translatedP2 = new DOMPoint(p2.x - p1.x, p2.y - p1.y);
        line.k = translatedP2.y / translatedP2.x;
        line.b = translatedP2.y - translatedP2.x * this.k;
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
        var x = (line.b - this.b) / (line.k - this.k);
        if (line.k == this.k) {
            //lines are parallel
            return null;
        }
        if (x > line.x1 && x < line.x2 && x > this.x1 && x < this.x2) {
            return this.GetPoint(x);
        }
        return null;
    };
    Line.prototype.GetNormal = function (point) {
        var newK = -1 / this.k;
        return Line.CreateLineByK(point, newK);
    };
    Line.prototype.GetRotatedLine = function (angle) {
        return new Line();
    };
    return Line;
}());
var Ray = /** @class */ (function () {
    function Ray(startPoint, directionPoint) {
        this.line = new Line();
        this.startPoint = startPoint;
        this.directionPoint = directionPoint;
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
        this.line.RefreshLine(this.startPoint, this.directionPoint);
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
    return Ray;
}());
var ProcessedRay = /** @class */ (function () {
    function ProcessedRay() {
    }
    return ProcessedRay;
}());
var OpticalElement = /** @class */ (function () {
    function OpticalElement() {
    }
    Object.defineProperty(OpticalElement.prototype, "Point1", {
        get: function () {
            return this.point1;
        },
        set: function (value) {
            this.point1 = value;
            this.line.RefreshLine(this.point1, this.point2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpticalElement.prototype, "Point2", {
        get: function () {
            return this.point1;
        },
        set: function (value) {
            this.point2 = value;
            this.line.RefreshLine(this.point1, this.point2);
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
    function Mirror() {
        var _this = _super.call(this) || this;
        _this.line = new Line();
        return _this;
    }
    Mirror.prototype.GetProcessedRay = function (ray) {
        var intersection = ray.GetIntersecion(this);
        var normal = this.line.GetNormal(intersection);
        return new Ray(new DOMPoint(), new DOMPoint());
    };
    return Mirror;
}(OpticalElement));
//# sourceMappingURL=app.js.map