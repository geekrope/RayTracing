"use strict";
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
var mirrorColor = "#c0c0c0";
var lensColor = "#1E90FF";
var rayColor = "#ffff30";
var mirrorThickness = 5;
var lensThickness = 3;
var rayThickness = 2;
var rayShadowBlur = 10;
var metricsColor = "#646464";
var alpha = 0.8;
var radius = 10;
var metricsRadius = 4;
var adornerColor = "#1E90FF";
var adornerFillColor = "#FFFFFF";
var adornerThickness = 2;
var raySourceColor = "#303030";
var raySourceThickness = 4;
var arrowSize = 35;
var textSize = 24;
var textFont = "Arial";
function DrawPolygon(points, cnvsId, fill) {
    if (fill === void 0) { fill = false; }
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.beginPath();
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (var index = 1; index < points.length; index++) {
                    ctx.lineTo(points[index].x, points[index].y);
                }
            }
            if (fill) {
                ctx.fill();
            }
            ctx.stroke();
        }
    }
}
function DrawLine(line, cnvsId) {
    var x0Point = line.GetPointByX(0);
    var xFullWidthPoint = line.GetPointByX(screen.width);
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x0Point.x, x0Point.y);
            ctx.lineTo(xFullWidthPoint.x, xFullWidthPoint.y);
            ctx.stroke();
        }
    }
}
function DrawPoint(point, cnvsId, radius, fill) {
    if (fill === void 0) { fill = false; }
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 360);
            ctx.stroke();
            if (fill) {
                ctx.fill();
            }
        }
    }
}
function DrawMirror(mirror, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.strokeStyle = mirrorColor;
            ctx.lineWidth = mirrorThickness;
            ctx.beginPath();
            ctx.moveTo(mirror.Point1.x, mirror.Point1.y);
            ctx.lineTo(mirror.Point2.x, mirror.Point2.y);
            ctx.stroke();
        }
    }
}
function DrawSegment(point1, point2, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
        }
    }
}
function DrawLens(lens, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.strokeStyle = lensColor;
            ctx.lineWidth = lensThickness;
            DrawSegment(lens.Point1, lens.Point2, cnvsId);
            var lensAngle = Math.atan2(lens.Point2.y - lens.Point1.y, lens.Point2.x - lens.Point1.x);
            var firstLineAngle = lensAngle - Math.PI / 4;
            var secondLineAngle = Math.PI / 4 + lensAngle;
            var thirdLineAngle = lensAngle + Math.PI / 4 * 3;
            var fourthLineAngle = lensAngle - Math.PI / 4 * 3;
            var firstPoint = new DOMPoint(lens.Point1.x + Math.cos(firstLineAngle) * arrowSize, lens.Point1.y + Math.sin(firstLineAngle) * arrowSize);
            var secondPoint = new DOMPoint(lens.Point1.x + Math.cos(secondLineAngle) * arrowSize, lens.Point1.y + Math.sin(secondLineAngle) * arrowSize);
            var thirdPoint = new DOMPoint(lens.Point2.x + Math.cos(thirdLineAngle) * arrowSize, lens.Point2.y + Math.sin(thirdLineAngle) * arrowSize);
            var fourthPoint = new DOMPoint(lens.Point2.x + Math.cos(fourthLineAngle) * arrowSize, lens.Point2.y + Math.sin(fourthLineAngle) * arrowSize);
            DrawPolygon([firstPoint, lens.Point1, secondPoint], cnvsId);
            DrawPolygon([thirdPoint, lens.Point2, fourthPoint], cnvsId);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = metricsColor;
            DrawLine(lens.MainOpticalAxis, cnvsId);
            var mid = lens.Line.GetMidPoint();
            var ray1 = new Ray(mid, lens.MainOpticalAxis.GetPointByX(0));
            var ray2 = new Ray(mid, lens.MainOpticalAxis.GetPointByX(screen.width));
            var backF = GetRaySegment(ray1, ray1.StartPoint, lens.FocusDistance);
            var back2F = GetRaySegment(ray1, backF.point2, lens.FocusDistance);
            var forwardF = GetRaySegment(ray2, ray2.StartPoint, lens.FocusDistance);
            var forward2F = GetRaySegment(ray2, forwardF.point2, lens.FocusDistance);
            ctx.strokeStyle = metricsColor;
            ctx.fillStyle = adornerFillColor;
            DrawPoint(backF.point2, cnvsId, metricsRadius, true);
            DrawPoint(back2F.point2, cnvsId, metricsRadius, true);
            DrawPoint(forwardF.point2, cnvsId, metricsRadius, true);
            DrawPoint(forward2F.point2, cnvsId, metricsRadius, true);
            ctx.font = textSize + "px " + textFont;
            ctx.fillStyle = metricsColor;
            ctx.fillText("2F", back2F.point2.x + textSize, back2F.point2.y + textSize);
            ctx.fillText("F", backF.point2.x + textSize, backF.point2.y + textSize);
            ctx.fillText("F", forwardF.point2.x + textSize, forwardF.point2.y + textSize);
            ctx.fillText("2F", forward2F.point2.x + textSize, forward2F.point2.y + textSize);
            ctx.globalAlpha = 1;
        }
    }
}
function DrawProcessedRay(ray, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.strokeStyle = rayColor;
            ctx.lineWidth = rayThickness;
            ctx.shadowColor = rayColor;
            ctx.shadowBlur = rayShadowBlur;
            ctx.beginPath();
            if (ray instanceof ProcessedRay && ray.RefractionPoints.length > 0) {
                ctx.moveTo(ray.RefractionPoints[0].x, ray.RefractionPoints[0].y);
                var length_1 = ray.Closed ? ray.RefractionPoints.length : ray.RefractionPoints.length - 1;
                if (length_1 != 0) {
                    for (var index = 0; index < length_1; index++) {
                        ctx.lineTo(ray.RefractionPoints[index].x, ray.RefractionPoints[index].y);
                    }
                }
                if (!ray.Closed) {
                    var prevPoint = ray.RefractionPoints[ray.RefractionPoints.length - 2];
                    var lastPoint = ray.RefractionPoints[ray.RefractionPoints.length - 1];
                    var line = new Line(prevPoint, lastPoint);
                    if (prevPoint.x < lastPoint.x) {
                        var p = line.GetPointByX(screen.width);
                        ctx.lineTo(p.x, p.y);
                    }
                    else {
                        var p = line.GetPointByX(0);
                        ctx.lineTo(p.x, p.y);
                    }
                }
            }
            else if (ray instanceof Ray) {
                ctx.moveTo(ray.StartPoint.x, ray.StartPoint.y);
                var line = new Line(ray.StartPoint, ray.DirectionPoint);
                if (ray.StartPoint.x < ray.DirectionPoint.x) {
                    var p = line.GetPointByX(screen.width);
                    ctx.lineTo(p.x, p.y);
                }
                else {
                    var p = line.GetPointByX(0);
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
            ctx.shadowColor = "";
            ctx.shadowBlur = 0;
        }
    }
}
function DrawRaysSource(point1, point2, cnvsId) {
    var element = document.getElementById(cnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.strokeStyle = raySourceColor;
            ctx.lineWidth = raySourceThickness;
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
        }
    }
}
var Adorner = /** @class */ (function () {
    function Adorner(center, cnvsId) {
        this.insideAdorner = false;
        this.Center = center;
        this.cnvsId = cnvsId;
        this.clickPoint = new DOMPoint();
        var element = document.getElementById(this.cnvsId);
        if (element) {
            element.addEventListener("mousedown", this.MouseDown.bind(this));
            element.addEventListener("mousemove", this.MouseMove.bind(this));
            element.addEventListener("mouseup", this.MouseUp.bind(this));
        }
        this.AdornerMoved = undefined;
    }
    Adorner.prototype.MouseDown = function (ev) {
        if (GetDistance(new DOMPoint(ev.pageX, ev.pageY), this.Center) < radius) {
            this.insideAdorner = true;
        }
        else {
            this.insideAdorner = false;
        }
        this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
    };
    Adorner.prototype.MouseMove = function (ev) {
        if (this.insideAdorner) {
            this.Center.x += ev.pageX - this.clickPoint.x;
            this.Center.y += ev.pageY - this.clickPoint.y;
        }
        this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
        if (this.AdornerMoved != null) {
            this.AdornerMoved();
        }
    };
    Adorner.prototype.MouseUp = function () {
        this.insideAdorner = false;
    };
    Adorner.prototype.Draw = function () {
        var element = document.getElementById(this.cnvsId);
        if (element) {
            var ctx = (element).getContext("2d");
            if (ctx) {
                ctx.strokeStyle = adornerColor;
                ctx.lineWidth = adornerThickness;
                ctx.fillStyle = adornerFillColor;
                ctx.beginPath();
                ctx.arc(this.Center.x, this.Center.y, radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
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
        this.adorners = [];
        this.object = new LightSource(new DOMPoint(), new DOMPoint());
    }
    Object.defineProperty(ChangeableObject.prototype, "Object", {
        get: function () {
            return this.object;
        },
        enumerable: false,
        configurable: true
    });
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
        _this.ray = new RaySource(firstAdorner.Center, secondAdorner.Center);
        _this.object = _this.ray;
        firstAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        return _this;
    }
    VisualRay.prototype.UpdateRay = function () {
        this.ray.Point1 = this.adorners[0].Center;
        this.ray.Point2 = this.adorners[1].Center;
    };
    Object.defineProperty(VisualRay.prototype, "Rays", {
        get: function () {
            var rays = this.ray.GetRays();
            if (rays) {
                return rays;
            }
            else {
                return [];
            }
        },
        enumerable: false,
        configurable: true
    });
    VisualRay.prototype.Draw = function () {
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
    };
    return VisualRay;
}(ChangeableObject));
var VisualRarallelRays = /** @class */ (function (_super) {
    __extends(VisualRarallelRays, _super);
    function VisualRarallelRays(cnvsId) {
        var _this = _super.call(this, cnvsId) || this;
        _this.cnvsId = cnvsId;
        var firstAdorner = new Adorner(new DOMPoint(0, 0), _this.cnvsId);
        var secondAdorner = new Adorner(new DOMPoint(100, 100), _this.cnvsId);
        _this.adorners = [firstAdorner, secondAdorner];
        _this.ray = new ParallelRaysSource(firstAdorner.Center, secondAdorner.Center);
        _this.object = _this.ray;
        firstAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateRay.bind(_this);
        return _this;
    }
    VisualRarallelRays.prototype.Draw = function () {
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
        DrawRaysSource(this.ray.Point1, this.ray.Point2, this.cnvsId);
    };
    return VisualRarallelRays;
}(VisualRay));
var VisualMirror = /** @class */ (function (_super) {
    __extends(VisualMirror, _super);
    function VisualMirror(cnvsId) {
        var _this = _super.call(this) || this;
        _this.cnvsId = cnvsId;
        var firstAdorner = new Adorner(new DOMPoint(200, 200), _this.cnvsId);
        var secondAdorner = new Adorner(new DOMPoint(150, 100), _this.cnvsId);
        _this.adorners = [firstAdorner, secondAdorner];
        _this.mirror = new Mirror(firstAdorner.Center, secondAdorner.Center);
        _this.object = _this.mirror;
        firstAdorner.AdornerMoved = _this.UpdateMirror.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateMirror.bind(_this);
        _this.UpdateMirror();
        return _this;
    }
    VisualMirror.prototype.UpdateMirror = function () {
        this.mirror.Point1 = this.adorners[0].Center;
        this.mirror.Point2 = this.adorners[1].Center;
    };
    Object.defineProperty(VisualMirror.prototype, "Point1", {
        get: function () {
            return this.mirror.Point1;
        },
        set: function (value) {
            this.mirror.Point1 = value;
            this.adorners[0].Center = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VisualMirror.prototype, "Point2", {
        get: function () {
            return this.mirror.Point2;
        },
        set: function (value) {
            this.mirror.Point2 = value;
            this.adorners[1].Center = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VisualMirror.prototype, "Mirror", {
        get: function () {
            return this.mirror;
        },
        enumerable: false,
        configurable: true
    });
    VisualMirror.prototype.Draw = function () {
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
        DrawMirror(this.mirror, this.cnvsId);
    };
    return VisualMirror;
}(ChangeableObject));
var VisualLens = /** @class */ (function (_super) {
    __extends(VisualLens, _super);
    function VisualLens(cnvsId) {
        var _this = _super.call(this) || this;
        _this.cnvsId = cnvsId;
        var firstAdorner = new Adorner(new DOMPoint(200, 200), _this.cnvsId);
        var secondAdorner = new Adorner(new DOMPoint(150, 100), _this.cnvsId);
        _this.adorners = [firstAdorner, secondAdorner];
        _this.lens = new Lens(firstAdorner.Center, secondAdorner.Center);
        _this.object = _this.lens;
        firstAdorner.AdornerMoved = _this.UpdateLens.bind(_this);
        secondAdorner.AdornerMoved = _this.UpdateLens.bind(_this);
        _this.UpdateLens();
        return _this;
    }
    VisualLens.prototype.UpdateLens = function () {
        this.lens.Point1 = this.adorners[0].Center;
        this.lens.Point2 = this.adorners[1].Center;
    };
    Object.defineProperty(VisualLens.prototype, "Point1", {
        get: function () {
            return this.lens.Point1;
        },
        set: function (value) {
            this.lens.Point1 = value;
            this.adorners[0].Center = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VisualLens.prototype, "Point2", {
        get: function () {
            return this.lens.Point2;
        },
        set: function (value) {
            this.lens.Point2 = value;
            this.adorners[1].Center = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VisualLens.prototype, "Lens", {
        get: function () {
            return this.lens;
        },
        enumerable: false,
        configurable: true
    });
    VisualLens.prototype.Draw = function () {
        for (var index = 0; index < this.adorners.length; index++) {
            this.adorners[index].Draw();
        }
        DrawLens(this.lens, this.cnvsId);
    };
    return VisualLens;
}(ChangeableObject));
var Scene = /** @class */ (function () {
    function Scene(cnvsId) {
        this.cnvsId = cnvsId;
        this.opticalElements = [];
        this.raysources = [];
    }
    Object.defineProperty(Scene.prototype, "RaySources", {
        get: function () {
            return this.raysources;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "CnvsId", {
        get: function () {
            return this.cnvsId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "OpticalElements", {
        get: function () {
            return this.opticalElements;
        },
        enumerable: false,
        configurable: true
    });
    Scene.prototype.AddRay = function (ev) {
        this.raysources.push(new VisualRay(this.cnvsId));
    };
    Scene.prototype.AddParallelRays = function (ev) {
        this.raysources.push(new VisualRarallelRays(this.cnvsId));
    };
    Scene.prototype.AddMirror = function (ev) {
        this.opticalElements.push(new VisualMirror(this.cnvsId));
    };
    Scene.prototype.AddLens = function (ev) {
        this.opticalElements.push(new VisualLens(this.cnvsId));
    };
    Scene.prototype.BindClickEvent = function (id, action) {
        var element = document.getElementById(id);
        if (element) {
            switch (action) {
                case "addray":
                    element.addEventListener("click", this.AddRay.bind(this));
                    break;
                case "addmirror":
                    element.addEventListener("click", this.AddMirror.bind(this));
                    break;
                case "addlens":
                    element.addEventListener("click", this.AddLens.bind(this));
                    break;
                case "addparallelrays":
                    element.addEventListener("click", this.AddParallelRays.bind(this));
                    break;
                default:
                    break;
            }
        }
    };
    return Scene;
}());
var scene = new Scene("playground");
function Draw(scene) {
    var element = document.getElementById(scene.CnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            var rect = element.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            var rays = [];
            var opticalElements = [];
            for (var index = 0; index < scene.RaySources.length; index++) {
                scene.RaySources[index].Draw();
                if (scene.RaySources[index].Rays) {
                    rays = rays.concat(scene.RaySources[index].Rays);
                }
            }
            for (var index = 0; index < scene.OpticalElements.length; index++) {
                scene.OpticalElements[index].Draw();
                if (scene.OpticalElements[index].Object instanceof OpticalElement) {
                    opticalElements.push(scene.OpticalElements[index].Object);
                }
            }
            for (var index = 0; index < rays.length; index++) {
                var processedRay = ProcessRay(opticalElements, rays[index]);
                DrawProcessedRay(processedRay, scene.CnvsId);
            }
        }
    }
    requestAnimationFrame(function () { Draw(scene); });
}
function PrepareCanvas() {
    var element = document.getElementById(scene.CnvsId);
    if (element) {
        var ctx = (element).getContext("2d");
        if (ctx) {
            ctx.lineCap = "round";
        }
    }
    OnResize();
}
function OnResize() {
    var element = document.getElementById(scene.CnvsId);
    if (element) {
        element.setAttribute("width", innerWidth.toString());
        element.setAttribute("height", innerHeight.toString());
    }
}
this.onload = function () {
    PrepareCanvas();
    Draw(scene);
    scene.BindClickEvent("addRay", "addray");
    scene.BindClickEvent("addRarallelRays", "addparallelrays");
    scene.BindClickEvent("addMirror", "addmirror");
    scene.BindClickEvent("addLens", "addlens");
};
this.onresize = OnResize;
//# sourceMappingURL=draw.js.map