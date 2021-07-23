/// <reference path="maths.ts"/>
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
var mirrorColor = "#303030";
var rayColor = "#ffff30";
var mirrorThickness = 5;
var rayThickness = 2;
function DrawMirror(mirror, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        ctx.strokeStyle = mirrorColor;
        ctx.lineWidth = mirrorThickness;
        ctx.beginPath();
        ctx.moveTo(mirror.Point1.x, mirror.Point1.y);
        ctx.lineTo(mirror.Point2.x, mirror.Point2.y);
        ctx.closePath();
        ctx.stroke();
    }
}
function DrawProcessedRay(ray, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        ctx.strokeStyle = rayColor;
        ctx.lineWidth = rayThickness;
        ctx.beginPath();
        if (ray instanceof ProcessedRay) {
            ctx.moveTo(ray.RefractionPoints[0].x, ray.RefractionPoints[0].y);
            var length_1 = ray.Closed ? ray.RefractionPoints.length : ray.RefractionPoints.length - 1;
            for (var index = 1; index < length_1; index++) {
                ctx.lineTo(ray.RefractionPoints[index].x, ray.RefractionPoints[index].y);
            }
            if (!ray.Closed) {
                var prevPoint = ray.RefractionPoints[ray.RefractionPoints.length - 1];
                var lastPoint = ray.RefractionPoints[ray.RefractionPoints.length];
                var line = new Line(prevPoint, lastPoint);
                if (prevPoint.x < lastPoint.x) {
                    var p = line.GetPoint(screen.width);
                    ctx.lineTo(p.x, p.y);
                }
                else {
                    var p = line.GetPoint(0);
                    ctx.lineTo(p.x, p.y);
                }
            }
        }
        else if (ray instanceof Ray) {
            ctx.moveTo(ray.StartPoint.x, ray.StartPoint.y);
            var line = new Line(ray.StartPoint, ray.DirectionPoint);
            if (ray.StartPoint.x < ray.DirectionPoint.x) {
                var p = line.GetPoint(screen.width);
                ctx.lineTo(p.x, p.y);
            }
            else {
                var p = line.GetPoint(0);
                ctx.lineTo(p.x, p.y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}
var Radius = 10;
var AdornerColor = "#1E90FF";
var AdornerFillColor = "#FFFFFF";
var AdornerThickness = 2;
var Adorner = /** @class */ (function () {
    function Adorner(center, cnvsId) {
        this.insideAdorner = false;
        this.center = center;
        this.cnvsId = cnvsId;
        this.clickPoint = new DOMPoint();
        var element = document.getElementById(this.cnvsId);
        if (element) {
            element.addEventListener("mousedown", this.MouseDown.bind(this));
            element.addEventListener("mousemove", this.MouseMove.bind(this));
            element.addEventListener("mouseup", this.MouseUp.bind(this));
        }
    }
    Adorner.prototype.MouseDown = function (ev) {
        if (GetDistance(new DOMPoint(ev.pageX, ev.pageY), this.center) < Radius) {
            this.insideAdorner = true;
        }
        else {
            this.insideAdorner = false;
        }
        this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
    };
    Adorner.prototype.MouseMove = function (ev) {
        if (this.insideAdorner) {
            this.center.x += ev.pageX - this.clickPoint.x;
            this.center.y += ev.pageY - this.clickPoint.y;
        }
        this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
        if (this.AdornerMoved != null) {
            this.AdornerMoved();
        }
    };
    Adorner.prototype.MouseUp = function () {
        this.insideAdorner = false;
    };
    Object.defineProperty(Adorner.prototype, "Center", {
        get: function () {
            return this.center;
        },
        enumerable: false,
        configurable: true
    });
    Adorner.prototype.Draw = function () {
        var element = document.getElementById(this.cnvsId);
        if (element) {
            var ctx = (element).getContext("2d");
            ctx.strokeStyle = AdornerColor;
            ctx.lineWidth = AdornerThickness;
            ctx.fillStyle = AdornerFillColor;
            ctx.beginPath();
            ctx.arc(this.center.x, this.center.y, Radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    };
    Adorner.prototype.Dispose = function () {
        var element = document.getElementById(this.cnvsId);
        if (element) {
            element.removeEventListener("mousedown", this.MouseDown);
            element.removeEventListener("mousemove", this.MouseMove);
            element.removeEventListener("mouseup", this.MouseUp);
        }
    };
    return Adorner;
}());
var ChangeableObject = /** @class */ (function () {
    function ChangeableObject() {
    }
    ChangeableObject.prototype.Draw = function () {
    };
    return ChangeableObject;
}());
var VisualRay = /** @class */ (function (_super) {
    __extends(VisualRay, _super);
    function VisualRay(cnvsId) {
        var _this = _super.call(this) || this;
        _this.cnvsId = cnvsId;
        var firstAdorner = new Adorner(new DOMPoint(0, 0), _this.cnvsId);
        var secondAdorner = new Adorner(new DOMPoint(100, 100), _this.cnvsId);
        _this.adorners = [firstAdorner, secondAdorner];
        _this.ray = new Ray(firstAdorner.Center, secondAdorner.Center);
        firstAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        return _this;
    }
    VisualRay.prototype.UpdateRay = function () {
        this.ray.StartPoint = this.adorners[0].Center;
        this.ray.DirectionPoint = this.adorners[1].Center;
    };
    Object.defineProperty(VisualRay.prototype, "Ray", {
        get: function () {
            return this.ray;
        },
        enumerable: false,
        configurable: true
    });
    VisualRay.prototype.Draw = function () {
        DrawProcessedRay(this.ray, this.cnvsId);
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
    };
    return VisualRay;
}(ChangeableObject));
var VisualMirror = /** @class */ (function (_super) {
    __extends(VisualMirror, _super);
    function VisualMirror(cnvsId) {
        var _this = _super.call(this) || this;
        _this.cnvsId = cnvsId;
        var firstAdorner = new Adorner(new DOMPoint(200, 200), _this.cnvsId);
        var secondAdorner = new Adorner(new DOMPoint(150, 100), _this.cnvsId);
        _this.adorners = [firstAdorner, secondAdorner];
        _this.mirror = new Mirror(firstAdorner.Center, secondAdorner.Center);
        firstAdorner.AdornerMoved = _this.UpdateMirror.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateMirror.bind(_this);
        return _this;
    }
    VisualMirror.prototype.UpdateMirror = function () {
        this.mirror.Point1 = this.adorners[0].Center;
        this.mirror.Point2 = this.adorners[1].Center;
    };
    Object.defineProperty(VisualMirror.prototype, "Mirror", {
        get: function () {
            return this.mirror;
        },
        enumerable: false,
        configurable: true
    });
    VisualMirror.prototype.Draw = function () {
        DrawMirror(this.mirror, this.cnvsId);
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
    };
    return VisualMirror;
}(ChangeableObject));
var ray = null;
var mirror = null;
function Draw() {
    var element = document.getElementById("playground");
    if (element) {
        var ctx = (element).getContext("2d");
        ctx.clearRect(0, 0, 2560, 1440);
    }
    ray.Draw();
    mirror.Draw();
    var reflection = mirror.Mirror.GetProcessedRay(ray.Ray);
    if (reflection) {
        DrawProcessedRay(reflection[0], "playground");
        DrawProcessedRay(reflection[1], "playground");
    }
    requestAnimationFrame(Draw);
}
this.onload = function () {
    ray = new VisualRay("playground");
    mirror = new VisualMirror("playground");
    Draw();
};
//# sourceMappingURL=draw.js.map