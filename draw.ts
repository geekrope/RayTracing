/// <reference path="maths.ts"/>

const mirrorColor = "#c0c0c0";
const rayColor = "#ffff30";
const mirrorThickness = 5;
const rayThickness = 2;
const rayShadowBlur = 10;

function DrawMirror(mirror: Mirror, cnvsId: string) {
	let element = document.getElementById(cnvsId);
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
	let element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = rayColor;
		ctx.lineWidth = rayThickness;

		ctx.shadowColor = rayColor;
		ctx.shadowBlur = rayShadowBlur;

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
					let p = line.GetPointByX(screen.width);
					ctx.lineTo(p.x, p.y);
				}
				else {
					let p = line.GetPointByX(0);
					ctx.lineTo(p.x, p.y);
				}
			}
		}
		else if (ray instanceof Ray) {
			ctx.moveTo(ray.StartPoint.x, ray.StartPoint.y);

			let line = new Line(ray.StartPoint, ray.DirectionPoint);

			if (ray.StartPoint.x < ray.DirectionPoint.x) {
				let p = line.GetPointByX(screen.width);
				ctx.lineTo(p.x, p.y);
			}
			else {
				let p = line.GetPointByX(0);
				ctx.lineTo(p.x, p.y);
			}
		}

		ctx.stroke();

		ctx.shadowColor = "";
		ctx.shadowBlur = 0;
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

		let element = document.getElementById(this.cnvsId);
		if (element) {
			element.addEventListener("mousedown", this.MouseDown.bind(this));
			element.addEventListener("mousemove", this.MouseMove.bind(this));
			element.addEventListener("mouseup", this.MouseUp.bind(this));
		}
	}

	public Draw(): void {
		let element = document.getElementById(this.cnvsId);
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
		let element = document.getElementById(this.cnvsId);
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

	public get Object(): OpticalElement | Ray {
		return this.object;
	}

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

		let firstAdorner = new Adorner(new DOMPoint(0, 0), this.cnvsId);
		let secondAdorner = new Adorner(new DOMPoint(100, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.ray = new Ray(firstAdorner.Center, secondAdorner.Center);
		this.object = this.ray;

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

		let firstAdorner = new Adorner(new DOMPoint(200, 200), this.cnvsId);
		let secondAdorner = new Adorner(new DOMPoint(150, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.mirror = new Mirror(firstAdorner.Center, secondAdorner.Center);
		this.object = this.mirror;

		firstAdorner.AdornerMoved = this.UpdateMirror.bind(this);
		secondAdorner.AdornerMoved = this.UpdateMirror.bind(this);

		this.UpdateMirror();
	}

	public Draw(): void {
		DrawMirror(this.mirror, this.cnvsId);
		for (let index = 0; index < this.adorners.length; index++) {
			this.adorners[index].Draw();
		}
	}
}

class Scene {
	private cnvsId: string;

	private opticalElements: ChangeableObject[];
	private rays: VisualRay[];

	public get Rays(): VisualRay[] {
		return this.rays;
	}

	public get CnvsId(): string {
		return this.cnvsId;
	}

	public get OpticalElements(): ChangeableObject[] {
		return this.opticalElements;
	}

	constructor(cnvsId: string) {
		this.cnvsId = cnvsId;
		this.opticalElements = [];
		this.rays = [];
	}

	public AddRay(ev: MouseEvent): void {
		this.rays.push(new VisualRay(this.cnvsId));
	}

	public AddMirror(ev: MouseEvent): void {
		this.opticalElements.push(new VisualMirror(this.cnvsId));
	}

	public BindClickEvent(id: string, action: action): void {
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
					element.addEventListener("click", this.AddRay.bind(this));
					break;
				default:
					break;
			}
		}
	}
}

type action = "addray" | "addmirror" | "addlens";

var scene = new Scene("playground");

function Draw(scene: Scene): void {
	let element = document.getElementById(scene.CnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");
		let rect = element.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		for (let rayInd = 0; rayInd < scene.Rays.length; rayInd++) {
			let opticalElements: OpticalElement[] = [];
			let value = scene.Rays[rayInd];

			for (let opticalElementInd = 0; opticalElementInd < scene.OpticalElements.length; opticalElementInd++) {
				let value = scene.OpticalElements[opticalElementInd];
				if (!(value.Object instanceof Ray) && value.Object) {
					opticalElements.push(value.Object);
					value.Draw();
				}
			}
			let processedRay = ProcessRay(opticalElements, value.Ray);
			if (processedRay) {
				DrawProcessedRay(processedRay, scene.CnvsId);
			}
			value.Draw();
		}
	}
	requestAnimationFrame(() => { Draw(scene) });
}

this.onload = () => {
	Draw(scene);
	scene.BindClickEvent("addRay", "addray");
	scene.BindClickEvent("addMirror", "addmirror");
}