/// <reference path="maths.ts"/>

const mirrorColor = "#303030";
const rayColor = "#ffff30";
const mirrorThickness = 5;
const rayThickness = 2;

function DrawMirror(mirror: Mirror, cnvsId: string) {
	var element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = mirrorColor;
		ctx.lineWidth = mirrorThickness;

		ctx.beginPath();

		ctx.moveTo(mirror.Point1.x, mirror.Point1.y);
		ctx.lineTo(mirror.Point2.x, mirror.Point2.y);

		ctx.closePath();

		ctx.stroke();
	}
}

function DrawProcessedRay(ray: ProcessedRay, cnvsId: string) {
	var element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = rayColor;
		ctx.lineWidth = rayThickness;

		ctx.beginPath();

		ctx.moveTo(ray.RefractionPoints[0].x, ray.RefractionPoints[0].y);

		let length = ray.Closed ? ray.RefractionPoints.length : ray.RefractionPoints.length - 1;
		for (let index = 1; index < length; index++) {
			ctx.lineTo(ray.RefractionPoints[index].x, ray.RefractionPoints[index].y);
		}

		if (!ray.Closed) {
			var prevPoint = ray.RefractionPoints[ray.RefractionPoints.length - 1];
			var lastPoint = ray.RefractionPoints[ray.RefractionPoints.length];
			let line = new Line(prevPoint, lastPoint);
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