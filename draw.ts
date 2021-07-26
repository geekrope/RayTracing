/// <reference path="maths.ts"/>

const mirrorColor = "#c0c0c0";
const lensColor = "#1E90FF";
const rayColor = "#ffff30";
const mirrorThickness = 5;
const lensThickness = 3;
const rayThickness = 2;
const rayShadowBlur = 10;
const metricsColor = "#646464";
const alpha = 0.8;
const radius = 10;
const metricsRadius = 4;
const adornerColor = "#1E90FF";
const adornerFillColor = "#FFFFFF";
const adornerThickness = 2;
const raySourceColor = "#303030";
const raySourceThickness = 4;

function DrawLine(line: Line, cnvsId: string) {
	let x0Point = line.GetPointByX(0);
	let xFullWidthPoint = line.GetPointByX(screen.width);

	let element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.beginPath();

		ctx.moveTo(x0Point.x, x0Point.y);
		ctx.lineTo(xFullWidthPoint.x, xFullWidthPoint.y);

		ctx.stroke();
	}
}

function DrawPoint(point: DOMPoint, cnvsId: string, radius: number, fill: boolean = false) {
	let element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.beginPath();

		ctx.arc(point.x, point.y, radius, 0, 360);

		ctx.stroke();

		if (fill) {
			ctx.fill();
		}
	}
}

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

function DrawLens(lens: Lens, cnvsId: string) {
	let element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = lensColor;
		ctx.lineWidth = lensThickness;

		ctx.beginPath();

		ctx.moveTo(lens.Point1.x, lens.Point1.y);
		ctx.lineTo(lens.Point2.x, lens.Point2.y);

		ctx.stroke();

		ctx.globalAlpha = alpha;
		ctx.strokeStyle = metricsColor;

		DrawLine(lens.MainOpticalAxis, cnvsId);

		let mid = lens.Line.GetMidPoint();
		let ray1 = new Ray(mid, lens.MainOpticalAxis.GetPointByX(0));
		let ray2 = new Ray(mid, lens.MainOpticalAxis.GetPointByX(screen.width));

		let backF = GetRaySegment(ray1, ray1.StartPoint, lens.FocusDistance);
		let back2F = GetRaySegment(ray1, backF.point2, lens.FocusDistance);

		let forwardF = GetRaySegment(ray2, ray2.StartPoint, lens.FocusDistance);
		let forwardF2F = GetRaySegment(ray2, forwardF.point2, lens.FocusDistance);

		ctx.strokeStyle = metricsColor;
		ctx.fillStyle = adornerFillColor;

		DrawPoint(backF.point2, cnvsId, metricsRadius, true);
		DrawPoint(back2F.point2, cnvsId, metricsRadius, true);
		DrawPoint(forwardF.point2, cnvsId, metricsRadius, true);
		DrawPoint(forwardF2F.point2, cnvsId, metricsRadius, true);

		ctx.globalAlpha = 1;
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

function DrawRaysSource(point1: DOMPoint, point2: DOMPoint, cnvsId: string) {
	let element = document.getElementById(cnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");

		ctx.strokeStyle = raySourceColor;
		ctx.lineWidth = raySourceThickness;

		ctx.beginPath();

		ctx.moveTo(point1.x, point1.y);
		ctx.lineTo(point2.x, point2.y);

		ctx.stroke();
	}
}

interface AdornerMoved {
	(): void;
}

class Adorner {
	private cnvsId: string;
	private insideAdorner: boolean = false;
	private clickPoint: DOMPoint;

	public Center: DOMPoint;

	private MouseDown(ev: MouseEvent) {
		if (GetDistance(new DOMPoint(ev.pageX, ev.pageY), this.Center) < radius) {
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
	protected object: OpticalElement | LightSource;

	public get Object(): OpticalElement | LightSource {
		return this.object;
	}

	public Draw(): void {

	}
}

class VisualRay extends ChangeableObject {
	protected cnvsId: string;
	protected ray: LightSource;

	protected UpdateRay() {
		this.ray.Point1 = this.adorners[0].Center;
		this.ray.Point2 = this.adorners[1].Center;
	}

	public get Rays(): Ray[] {
		return this.ray.GetRays();
	}

	public constructor(cnvsId: string) {
		super();
		this.cnvsId = cnvsId;

		let firstAdorner = new Adorner(new DOMPoint(0, 0), this.cnvsId);
		let secondAdorner = new Adorner(new DOMPoint(100, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.ray = new RaySource(firstAdorner.Center, secondAdorner.Center);
		this.object = this.ray;

		firstAdorner.AdornerMoved = this.UpdateRay.bind(this);
		secondAdorner.AdornerMoved = this.UpdateRay.bind(this);
	}

	public Draw(): void {
		for (let index = 0; index < this.adorners.length; index++) {
			this.adorners[index].Draw();
		}
	}
}

class VisualRarallelRays extends VisualRay {
	public get Rays(): Ray[] {
		return this.ray.GetRays();
	}

	public constructor(cnvsId: string) {
		super(cnvsId);
		this.cnvsId = cnvsId;

		let firstAdorner = new Adorner(new DOMPoint(0, 0), this.cnvsId);
		let secondAdorner = new Adorner(new DOMPoint(100, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.ray = new ParallelRaysSource(firstAdorner.Center, secondAdorner.Center);
		this.object = this.ray;

		firstAdorner.AdornerMoved = this.UpdateRay.bind(this);
		secondAdorner.AdornerMoved = this.UpdateRay.bind(this);
	}

	public Draw(): void {
		DrawRaysSource(this.ray.Point1, this.ray.Point2, this.cnvsId);
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

class VisualLens extends ChangeableObject {
	private cnvsId: string;
	private lens: Lens;

	private UpdateLens() {
		this.lens.Point1 = this.adorners[0].Center;
		this.lens.Point2 = this.adorners[1].Center;
	}

	public get Point1(): DOMPoint {
		return this.lens.Point1;
	}
	public get Point2(): DOMPoint {
		return this.lens.Point2;
	}

	public set Point1(value: DOMPoint) {
		this.lens.Point1 = value;
		this.adorners[0].Center = value;
	}
	public set Point2(value: DOMPoint) {
		this.lens.Point2 = value;
		this.adorners[1].Center = value;
	}

	public get Lens(): Lens {
		return this.lens;
	}

	public constructor(cnvsId: string) {
		super();
		this.cnvsId = cnvsId;

		let firstAdorner = new Adorner(new DOMPoint(200, 200), this.cnvsId);
		let secondAdorner = new Adorner(new DOMPoint(150, 100), this.cnvsId);

		this.adorners = [firstAdorner, secondAdorner];

		this.lens = new Lens(firstAdorner.Center, secondAdorner.Center);
		this.object = this.lens;

		firstAdorner.AdornerMoved = this.UpdateLens.bind(this);
		secondAdorner.AdornerMoved = this.UpdateLens.bind(this);

		this.UpdateLens();
	}

	public Draw(): void {
		DrawLens(this.lens, this.cnvsId);
		for (let index = 0; index < this.adorners.length; index++) {
			this.adorners[index].Draw();
		}
	}
}

class Scene {
	private cnvsId: string;

	private opticalElements: ChangeableObject[];
	private raysources: VisualRay[];

	public get RaySources(): VisualRay[] {
		return this.raysources;
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
		this.raysources = [];
	}

	public AddRay(ev: MouseEvent): void {
		this.raysources.push(new VisualRay(this.cnvsId));
	}

	public AddParallelRays(ev: MouseEvent): void {
		this.raysources.push(new VisualRarallelRays(this.cnvsId));
	}

	public AddMirror(ev: MouseEvent): void {
		this.opticalElements.push(new VisualMirror(this.cnvsId));
	}

	public AddLens(ev: MouseEvent): void {
		this.opticalElements.push(new VisualLens(this.cnvsId));
	}

	public BindClickEvent(id: string, action: action): void {
		let element = document.getElementById(id);
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
	}
}

type action = "addray" | "addmirror" | "addlens" | "addparallelrays";

let scene = new Scene("playground");

function Draw(scene: Scene): void {
	let element = document.getElementById(scene.CnvsId);
	if (element) {
		let ctx = (<HTMLCanvasElement>(element)).getContext("2d");
		let rect = element.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		let rays: Ray[] = [];
		let opticalElements: OpticalElement[] = [];

		for (let index = 0; index < scene.RaySources.length; index++) {
			scene.RaySources[index].Draw();
			rays = rays.concat(scene.RaySources[index].Rays);
		}

		for (let index = 0; index < scene.OpticalElements.length; index++) {
			scene.OpticalElements[index].Draw();
			if (scene.OpticalElements[index].Object instanceof OpticalElement) {
				opticalElements.push(<OpticalElement>scene.OpticalElements[index].Object);
			}
		}

		for (let index = 0; index < rays.length; index++) {
			var processedRay = ProcessRay(opticalElements, rays[index]);
			DrawProcessedRay(processedRay, scene.CnvsId);
		}
	}
	requestAnimationFrame(() => { Draw(scene) });
}

this.onload = () => {
	Draw(scene);
	scene.BindClickEvent("addRay", "addray");
	scene.BindClickEvent("addRarallelRays", "addparallelrays");
	scene.BindClickEvent("addMirror", "addmirror");
	scene.BindClickEvent("addLens", "addlens");
}