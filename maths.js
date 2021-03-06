"use strict";
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
function GetRaySegment(ray, point, dist) {
    var xAbs = Math.sqrt(dist * dist / (ray.Line.k * ray.Line.k + 1));
    if (ray.StartPoint.x > ray.DirectionPoint.x) {
        xAbs = -xAbs;
    }
    var y = xAbs * ray.Line.k;
    return { point1: point, point2: new DOMPoint(xAbs + point.x, y + point.y) };
}
function DegToRad(angle) {
    return angle / Math.PI * 180;
}
function SegmentOnTheScreen(segment) {
    return Math.min(segment.point1.y, segment.point2.y) >= 0 && Math.min(segment.point1.x, segment.point2.x) >= 0 &&
        Math.max(segment.point1.y, segment.point2.y) <= screen.height && Math.max(segment.point1.x, segment.point2.x) <= screen.width;
}
function RotatePoint(point, center, angle) {
    var translatedPoint = new DOMPoint(point.x - center.x, point.y - center.y, point.z, point.w);
    var distance = GetDistance(new DOMPoint(0, 0), translatedPoint);
    var addedAngle = Math.atan2(translatedPoint.y, translatedPoint.x);
    translatedPoint.x = distance * Math.cos(addedAngle + angle);
    translatedPoint.y = distance * Math.sin(addedAngle + angle);
    translatedPoint.x += center.x;
    translatedPoint.y += center.y;
    return translatedPoint;
}
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        if (p1 === void 0) { p1 = null; }
        if (p2 === void 0) { p2 = null; }
        this.x1 = Number.NEGATIVE_INFINITY;
        this.x2 = Number.POSITIVE_INFINITY;
        this.k = 0;
        this.b = 0;
        if (p1 && p2) {
            var line = this.RefreshLine(p1, p2);
            this.k = line.k;
            this.b = line.b;
        }
    }
    Line.prototype.XInDeterminantSpace = function (x) {
        var inDeterminantSpace = false;
        if (this.x1 == Number.NEGATIVE_INFINITY) {
            if (isFinite(this.x2) && x <= this.x2) {
                inDeterminantSpace = true;
            }
            else if (this.x2 == Number.POSITIVE_INFINITY) {
                inDeterminantSpace = true;
            }
        }
        else if (this.x2 == Number.POSITIVE_INFINITY) {
            if (isFinite(this.x1) && x >= this.x1) {
                inDeterminantSpace = true;
            }
            else if (this.x1 == Number.NEGATIVE_INFINITY) {
                inDeterminantSpace = true;
            }
        }
        else {
            if (x >= this.x1 && x <= this.x2) {
                inDeterminantSpace = true;
            }
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
    Line.prototype.GetPointByY = function (y) {
        return new DOMPoint((y - this.b) / this.k, y);
    };
    Line.prototype.GetPointByX = function (x) {
        return new DOMPoint(x, x * this.k + this.b);
    };
    Line.prototype.GetIntersection = function (line) {
        var x = (line.b - this.b) / (this.k - line.k);
        if (line.k == this.k) {
            //lines are parallel
            return null;
        }
        if (this.XInDeterminantSpace(x) && line.XInDeterminantSpace(x)) {
            return this.GetPointByX(x);
        }
        return null;
    };
    Line.prototype.GetNormal = function (point) {
        var newK = -1 / this.k;
        return Line.CreateLineByK(point, newK);
    };
    Line.prototype.GetRotatedLine = function (angle, x) {
        var center = this.GetPointByX(x);
        var k = (Math.tan(angle) + this.k) / (1 - Math.tan(angle) * this.k);
        var rotatedLine = Line.CreateLineByK(center, k);
        return rotatedLine;
    };
    Line.prototype.GetMidPoint = function () {
        var point1 = this.GetPointByX(this.x1);
        var point2 = this.GetPointByX(this.x2);
        var midX = (point2.x - point1.x) / 2 + point1.x;
        var midY = (point2.y - point1.y) / 2 + point1.y;
        return new DOMPoint(midX, midY);
    };
    Line.prototype.GetParallelLine = function (point) {
        var parallelLine = new Line();
        parallelLine.k = this.k;
        parallelLine.b = point.y - point.x * parallelLine.k;
        return parallelLine;
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
            this.line.x1 = Number.NEGATIVE_INFINITY;
            this.line.x2 = this.startPoint.x;
        }
        else {
            this.line.x2 = Number.POSITIVE_INFINITY;
            this.line.x1 = this.startPoint.x;
        }
    };
    Ray.prototype.GetIntersecion = function (element) {
        return element.Line.GetIntersection(this.line);
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
        if (ray === void 0) { ray = null; }
        this.Closed = false;
        this.RefractionPoints = [];
        if (ray) {
            this.Closed = false;
            this.RefractionPoints = [ray.StartPoint, ray.DirectionPoint];
        }
    }
    ProcessedRay.Plus = function (ray, ray2) {
        var newRay = new ProcessedRay();
        newRay.RefractionPoints = ray.RefractionPoints.concat(ray2.RefractionPoints);
        newRay.Closed = ray2.Closed;
        return newRay;
    };
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
    Object.defineProperty(OpticalElement.prototype, "Line", {
        get: function () {
            return this.line;
        },
        enumerable: false,
        configurable: true
    });
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
var LightSource = /** @class */ (function () {
    function LightSource(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    Object.defineProperty(LightSource.prototype, "Point1", {
        get: function () {
            return this.point1;
        },
        set: function (value) {
            this.point1 = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightSource.prototype, "Point2", {
        get: function () {
            return this.point2;
        },
        set: function (value) {
            this.point2 = value;
        },
        enumerable: false,
        configurable: true
    });
    LightSource.prototype.GetRays = function () {
        return null;
    };
    return LightSource;
}());
var RaySource = /** @class */ (function (_super) {
    __extends(RaySource, _super);
    function RaySource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RaySource.prototype.GetRays = function () {
        return [new Ray(this.Point1, this.Point2)];
    };
    return RaySource;
}(LightSource));
var ParallelRaysSource = /** @class */ (function (_super) {
    __extends(ParallelRaysSource, _super);
    function ParallelRaysSource() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Distance = 50;
        return _this;
    }
    ParallelRaysSource.prototype.GetRays = function () {
        var sourceRay = new Ray(this.Point1, this.Point2);
        var rays = [];
        var createPoint = sourceRay.StartPoint;
        var angle = Math.atan2(sourceRay.DirectionPoint.y - sourceRay.StartPoint.y, sourceRay.DirectionPoint.x - sourceRay.StartPoint.x);
        for (var rayIndex = 0; rayIndex < Math.ceil(GetDistance(this.Point1, this.Point2) / this.Distance); rayIndex++) {
            var thirdAngle = Math.PI / 2 - angle;
            var directionalPoint = new DOMPoint(Math.cos(-thirdAngle) * this.Distance + createPoint.x, Math.sin(-thirdAngle) * this.Distance + createPoint.y);
            var ray = new Ray(createPoint, directionalPoint);
            createPoint = GetRaySegment(sourceRay, createPoint, this.Distance).point2;
            rays.push(ray);
        }
        return rays;
    };
    return ParallelRaysSource;
}(LightSource));
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
            var reflectedRay = new Ray(intersection, RotatePoint(ray.StartPoint, intersection, -2 * angle));
            return reflectedRay;
        }
        return null;
    };
    return Mirror;
}(OpticalElement));
//focusing lens
var Lens = /** @class */ (function (_super) {
    __extends(Lens, _super);
    function Lens(point1, point2) {
        var _this = _super.call(this, point1, point2) || this;
        _this.mainOpticalAxis = new Line();
        _this.FocusDistance = 100;
        return _this;
    }
    Lens.prototype.RebuildOpticalElement = function () {
        this.line = this.line.RefreshLine(this.Point1, this.Point2);
        this.line.x1 = Math.min(this.Point1.x, this.Point2.x);
        this.line.x2 = Math.max(this.Point1.x, this.Point2.x);
        this.mainOpticalAxis = this.line.GetNormal(this.line.GetMidPoint());
    };
    Object.defineProperty(Lens.prototype, "MainOpticalAxis", {
        get: function () {
            return this.mainOpticalAxis;
        },
        enumerable: false,
        configurable: true
    });
    Lens.prototype.GetProcessedRay = function (ray) {
        var intersection = ray.GetIntersecion(this);
        if (intersection) {
            var mid = this.line.GetMidPoint();
            var ray1 = new Ray(mid, this.mainOpticalAxis.GetPointByX(0));
            var ray2 = new Ray(mid, this.mainOpticalAxis.GetPointByX(screen.width));
            var normalToAxis = this.mainOpticalAxis.GetNormal(ray.StartPoint);
            var intersectRay1 = false;
            if (normalToAxis.GetIntersection(ray1.Line)) {
                intersectRay1 = true;
            }
            else if (normalToAxis.GetIntersection(ray2.Line)) {
                intersectRay1 = false;
            }
            var infiniteLine = new Line();
            infiniteLine.k = this.Line.k;
            infiniteLine.b = this.Line.b;
            var parallelLineToRay = ray.Line.GetParallelLine(mid);
            var focalPoint = null;
            if (intersectRay1) {
                focalPoint = GetRaySegment(ray2, ray2.StartPoint, this.FocusDistance).point2;
            }
            else {
                focalPoint = GetRaySegment(ray1, ray1.StartPoint, this.FocusDistance).point2;
            }
            var normalThroughFocus = this.mainOpticalAxis.GetNormal(focalPoint);
            var pointProjection = parallelLineToRay.GetIntersection(normalThroughFocus);
            if (pointProjection) {
                return new Ray(intersection, pointProjection);
            }
        }
        return null;
    };
    return Lens;
}(OpticalElement));
var step = 2;
function ProcessRay(elements, ray) {
    var processedRay = new ProcessedRay();
    processedRay.RefractionPoints = [ray.StartPoint];
    var newRay = ray;
    var segmentStartPoint = ray.StartPoint;
    var segment = GetRaySegment(newRay, segmentStartPoint, step);
    var lastCollideIndex = -1;
    for (; SegmentOnTheScreen(segment);) {
        segment = GetRaySegment(newRay, segmentStartPoint, step);
        var line = new Line(segment.point1, segment.point2);
        line.x1 = Math.min(segment.point1.x, segment.point2.x);
        line.x2 = Math.max(segment.point1.x, segment.point2.x);
        for (var index = 0; index < elements.length; index++) {
            if (elements[index].Line.GetIntersection(line) && lastCollideIndex != index) {
                lastCollideIndex = index;
                var procRay = elements[index].GetProcessedRay(newRay);
                if (procRay) {
                    newRay = procRay;
                    processedRay.RefractionPoints.push(newRay.StartPoint);
                }
            }
        }
        segmentStartPoint = segment.point2;
    }
    processedRay.RefractionPoints.push(newRay.DirectionPoint);
    return processedRay;
}
//# sourceMappingURL=maths.js.map