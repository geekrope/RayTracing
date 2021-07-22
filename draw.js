/// <reference path="maths.ts"/>
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
        ctx.closePath();
        ctx.stroke();
    }
}
//# sourceMappingURL=draw.js.map