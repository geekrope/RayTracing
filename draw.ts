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

		ctx.stroke();
	}
}

function DrawProcessedRay(ray: ProcessedRay | Ray, cnvsId: string) {
	var element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = rayColor;
		ctx.lineWidth = rayThickness;

		ctx.beginPath();

		if (ray instanceof ProcessedRay && ray.RefractionPoints.length > 0) {
			ctx.moveTo(ray.RefractionPoints[0].x, ray.RefractionPoints[0].y);

			let length = ray.Closed ? ray.RefractionPoints.length : ray.RefractionPoints.length - 1;
			if (length != 0) {
				for (let index = 0; index < length; index++) {
					ctx.lineTo(ray.RefractionPoints[index].x, ray.RefractionPoints[index].y);
				}
			}

			if (!ray.Closed) {
				let prevPoint = ray.RefractionPoints[ray.RefractionPoints.length - 2];
				let lastPoint = ray.RefractionPoints[ray.RefractionPoints.length - 1];
				let line = new Line(prevPoint, lastPoint);
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

			let line = new Line(ray.StartPoint, ray.DirectionPoint);

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
	}
}

const Radius = 10;
const AdornerColor = "#1E90FF";
const AdornerFillColor = "#FFFFFF";
const AdornerThickness = 2;

interface AdornerMoved {
	(): void;
}

class Adorner {	
	private cnvsId: string;
	private insideAdorner: boolean = false;
	private clickPoint: DOMPoint;

	public Center: DOMPoint;

	private MouseDown(ev: MouseEvent) {
		if (GetDistance(new DOMPoint(ev.pageX, ev.pageY), this.Center) < Radius) {
			this.insideAdorner = true;
		}
		else {
			this.insideAdorner = false;
		}
		this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
	}

	private MouseMove(ev: MouseEvent) {
		if (this.insideAdorner) {
			this.Center.x += ev.pageX - this.clickPoint.x;
			this.Center.y += ev.pageY - this.clickPoint.y;
		}
		this.clickPoint = new DOMPoint(ev.pageX, ev.pageY);
		if (this.AdornerMoved != null) {
			this.AdornerMoved();
		}
	}

	private MouseUp() {
		this.insideAdorner = false;
	}

	public constructor(center: DOMPoint, cnvsId: string) {
		this.Center = center;
		this.cnvsId = cnvsId;
		this.clickPoint = new DOMPoint();

		var element = document.getElementById(this.cnvsId);
		if (element) {
			element.addEventListener("mousedown", this.MouseDown.bind(this));
			element.addEventListener("mousemove", this.MouseMove.bind(this));
			element.addEventListener("mouseup", this.MouseUp.bind(this));
		}
	}

	public Draw(): void {
		var element = document.getElementById(this.cnvsId);
		if (element) {
			let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

			ctx.strokeStyle = AdornerColor;
			ctx.lineWidth = AdornerThickness;
			ctx.fillStyle = AdornerFillColor;

			ctx.beginPath();
			ctx.arc(this.Center.x, this.Center.y, Radius, 0, Math.PI * 2);
			ctx.closePath();

			ctx.fill();
			ctx.stroke();
		}
	}

	public Dispose() {
		var element = document.getElementById(this.cnvsId);
		if (element) {
			element.removeEventListener("mousedown", this.MouseDown);
			element.removeEventListener("mousemove", this.MouseMove);
			element.removeEventListener("mouseup", this.MouseUp);
		}
	}

	public AdornerMoved: AdornerMoved;
}

class ChangeableObject {
	protected adorners: Adorner[];
	protected object: OpticalElement | Ray;

	public Draw(): void {

	}
}

class VisualRay extends ChangeableObject {
	private cnvsId: string;
	private ray: Ray;

	private UpdateRay() {
		this.ray.StartPoint = this.adorners[0].Center;
		this.ray.DirectionPoint = this.adorners[1].Center;
	}

	public get Ray(): Ray {
		return this.ray;
	}

	public constructor(cnvsId: string) {
		super();
		this.cnvsId = cnvsId;

		var firstAdorner = new Adorner(new DOMPoint(0, 0), this.cnvsId);
		var secondAdorner = new Adorner(new DOMPoint(100, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.ray = new Ray(firstAdorner.Center, secondAdorner.Center);

		firstAdorner.AdornerMoved = this.UpdateRay.bind(this);
		secondAdorner.AdornerMoved = this.UpdateRay.bind(this);
	}

	public Draw(): void {
		//DrawProcessedRay(this.ray, this.cnvsId);
		for (let index = 0; index < this.adorners.length; index++) {
			this.adorners[index].Draw();
		}
	}
}

class VisualMirror extends ChangeableObject {
	private cnvsId: string;
	private mirror: Mirror;

	private UpdateMirror() {
		this.mirror.Point1 = this.adorners[0].Center;
		this.mirror.Point2 = this.adorners[1].Center;
	}

	public get Point1(): DOMPoint {
		return this.mirror.Point1;
	}
	public get Point2(): DOMPoint {
		return this.mirror.Point2;
	}

	public set Point1(value: DOMPoint) {
		this.mirror.Point1 = value;
		this.adorners[0].Center = value;
	}
	public set Point2(value: DOMPoint) {
		this.mirror.Point2 = value;
		this.adorners[1].Center = value;
	}

	public get Mirror(): Mirror {
		return this.mirror;
	}

	public constructor(cnvsId: string) {
		super();
		this.cnvsId = cnvsId;

		var firstAdorner = new Adorner(new DOMPoint(200, 200), this.cnvsId);
		var secondAdorner = new Adorner(new DOMPoint(150, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.mirror = new Mirror(firstAdorner.Center, secondAdorner.Center);

		firstAdorner.AdornerMoved = this.UpdateMirror.bind(this);
		secondAdorner.AdornerMoved = this.UpdateMirror.bind(this);
	}

	public Draw(): void {
		DrawMirror(this.mirror, this.cnvsId);
		for (let index = 0; index < this.adorners.length; index++) {
			this.adorners[index].Draw();
		}
	}
}

var ray: VisualRay = null;
var mirror: VisualMirror = null;
var mirror2: VisualMirror = null;

function Draw() {
	var element = document.getElementById("playground");
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");
		ctx.clearRect(0, 0, 2560, 1440);
	}
	ray.Draw();
	mirror.Draw();
	mirror2.Draw();

	//drawSegment("playground", ray.Ray);

	var reflection = ProcessRay([mirror.Mirror, mirror2.Mirror], ray.Ray);
	if (reflection) {
		DrawProcessedRay(reflection, "playground");
	}

	requestAnimationFrame(Draw);
}

function drawSegment(cnvsId: string, ray: Ray) {
	var segment = GetRaySegment(ray, ray.StartPoint, 100);

	var element = document.getElementById(cnvsId);

	let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

	ctx.strokeStyle = mirrorColor;
	ctx.lineWidth = mirrorThickness;

	ctx.beginPath();

	ctx.moveTo(segment.point1.x, segment.point1.y);
	ctx.lineTo(segment.point2.x, segment.point2.y);

	ctx.closePath();

	ctx.stroke();
}

this.onload = () => {
	ray = new VisualRay("playground");
	mirror = new VisualMirror("playground");
	mirror2 = new VisualMirror("playground");
	mirror2.Point1 = new DOMPoint(300, 100);
	mirror2.Point2 = new DOMPoint(400, 200);
	Draw();
}