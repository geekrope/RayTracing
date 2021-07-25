function GetDistance(point1: DOMPoint, point2: DOMPoint): number {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function GetAngleBetweenLines(line1: Line, line2: Line): number {
	let tan = (line2.k - line1.k) / (1 + line1.k * line2.k);

	return Math.atan(tan);
}

function GetRaySegment(ray: Ray, point: DOMPoint, dist: number): { point1: DOMPoint, point2: DOMPoint } {
	let xAbs = Math.sqrt(dist * dist / (ray.Line.k * ray.Line.k + 1));

	if (ray.StartPoint.x > ray.DirectionPoint.x) {
		xAbs = -xAbs;
	}

	let y = xAbs * ray.Line.k;

	return { point1: point, point2: new DOMPoint(xAbs + point.x, y + point.y) };
}

function DegToRad(angle: number) {
	return angle / Math.PI * 180;
}

function SegmentOnTheScreen(segment: { point1: DOMPoint, point2: DOMPoint }): boolean {
	return Math.min(segment.point1.y, segment.point2.y) >= 0 && Math.min(segment.point1.x, segment.point2.x) >= 0 &&
		Math.max(segment.point1.y, segment.point2.y) <= screen.height && Math.max(segment.point1.x, segment.point2.x) <= screen.width;
}

function RotatePoint(point: DOMPoint, center: DOMPoint, angle: number): DOMPoint {
	let translatedPoint = new DOMPoint(point.x - center.x, point.y - center.y, point.z, point.w);
	let distance = GetDistance(new DOMPoint(0, 0), translatedPoint);
	let addedAngle = Math.atan2(translatedPoint.y, translatedPoint.x);
	translatedPoint.x = distance * Math.cos(addedAngle + angle);
	translatedPoint.y = distance * Math.sin(addedAngle + angle);
	translatedPoint.x += center.x;
	translatedPoint.y += center.y;
	return translatedPoint;
}

class Line {
	public x1 = Number.NEGATIVE_INFINITY;
	public x2 = Number.POSITIVE_INFINITY;

	public k: number;
	public b: number;

	public XInDeterminantSpace(x: number): boolean {
		let inDeterminantSpace = false;
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
	}

	public constructor(p1: DOMPoint = null, p2: DOMPoint = null) {
		if (p1 && p2) {
			let line = this.RefreshLine(p1, p2);
			this.k = line.k;
			this.b = line.b;
		}
	}

	public RefreshLine(p1: DOMPoint, p2: DOMPoint): Line {
		let line = new Line();
		let translatedP2 = new DOMPoint(p2.x - p1.x, p2.y - p1.y);
		line.k = translatedP2.y / translatedP2.x;
		line.b = p2.y - p2.x * line.k;
		return line;
	}

	public static CreateLineByK(p1: DOMPoint, k: number): Line {
		let line = new Line();
		line.k = k;
		line.b = p1.y - p1.x * k;
		return line;
	}

	public static CreateLineByB(b: number): Line {
		let line = new Line();
		line.b = b;
		line.k = 0;
		return line;
	}

	public GetPointByY(y: number): DOMPoint {
		return new DOMPoint((y - this.b) / this.k, y);
	}

	public GetPointByX(x: number): DOMPoint {
		return new DOMPoint(x, x * this.k + this.b);
	}

	public GetIntersection(line: Line): DOMPoint {
		let x = (line.b - this.b) / (this.k - line.k);

		if (line.k == this.k) {
			//lines are parallel
			return null;
		}

		if (this.XInDeterminantSpace(x) && line.XInDeterminantSpace(x)) {
			return this.GetPointByX(x);
		}
		return null;
	}

	public GetNormal(point: DOMPoint): Line {
		let newK = -1 / this.k;
		return Line.CreateLineByK(point, newK);
	}

	public GetRotatedLine(angle: number, x: number): Line {
		let center = this.GetPointByX(x);

		let k = (Math.tan(angle) + this.k) / (1 - Math.tan(angle) * this.k);

		let rotatedLine = Line.CreateLineByK(center, k);

		return rotatedLine;
	}

	public GetMidPoint(): DOMPoint {
		let point1 = this.GetPointByX(this.x1);
		let point2 = this.GetPointByX(this.x2);

		let midX = (point2.x - point1.x) / 2 + point1.x;
		let midY = (point2.y - point1.y) / 2 + point1.y;

		return new DOMPoint(midX, midY);
	}

	public GetParallelLine(point: DOMPoint): Line {
		var parallelLine = new Line();
		parallelLine.k = this.k;
		parallelLine.b = point.y - point.x * parallelLine.k;
		return parallelLine;
	}
}

class Ray {
	private startPoint: DOMPoint;
	private directionPoint: DOMPoint;
	private line: Line;

	public set StartPoint(value: DOMPoint) {
		this.startPoint = value;
		this.RebuildRay();
	}
	public set DirectionPoint(value: DOMPoint) {
		this.directionPoint = value;
		this.RebuildRay();
	}

	public get StartPoint(): DOMPoint {
		return this.startPoint;
	}
	public get DirectionPoint(): DOMPoint {
		return this.directionPoint;
	}

	private RebuildRay() {
		this.line = this.line.RefreshLine(this.startPoint, this.directionPoint);
		if (this.startPoint.x > this.directionPoint.x) {
			this.line.x1 = Number.NEGATIVE_INFINITY;
			this.line.x2 = this.startPoint.x;
		}
		else {
			this.line.x2 = Number.POSITIVE_INFINITY;
			this.line.x1 = this.startPoint.x;
		}
	}

	public constructor(startPoint: DOMPoint, directionPoint: DOMPoint) {
		this.line = new Line();
		this.startPoint = startPoint;
		this.directionPoint = directionPoint;
		this.RebuildRay();
	}

	public GetIntersecion(element: OpticalElement): DOMPoint {
		return element.Line.GetIntersection(this.line);
	}

	public get Line(): Line {
		return this.line;
	}
}

class ProcessedRay {
	public RefractionPoints: DOMPoint[];
	public Closed: boolean;

	constructor(ray: Ray = null) {
		this.RefractionPoints = [];
		if (ray) {
			this.Closed = false;
			this.RefractionPoints = [ray.StartPoint, ray.DirectionPoint];
		}
	}

	public static Plus(ray: ProcessedRay, ray2: ProcessedRay): ProcessedRay {
		let newRay = new ProcessedRay();
		newRay.RefractionPoints = ray.RefractionPoints.concat(ray2.RefractionPoints);
		newRay.Closed = ray.Closed || ray2.Closed;
		return newRay;
	}
}

class OpticalElement {
	protected point1: DOMPoint;
	protected point2: DOMPoint;

	protected RebuildOpticalElement(): void {
		this.line = this.line.RefreshLine(this.point1, this.point2);
		this.line.x1 = Math.min(this.point1.x, this.point2.x);
		this.line.x2 = Math.max(this.point1.x, this.point2.x);
	}

	protected line: Line;

	public get Line(): Line {
		return this.line;
	}

	public get Point1(): DOMPoint {
		return this.point1;
	}
	public get Point2(): DOMPoint {
		return this.point2;
	}

	public set Point1(value: DOMPoint) {
		this.point1 = value;
		this.RebuildOpticalElement();
	}
	public set Point2(value: DOMPoint) {
		this.point2 = value;
		this.RebuildOpticalElement();
	}

	public constructor(point1: DOMPoint, point2: DOMPoint) {
		this.line = new Line();
		this.point1 = point1;
		this.point2 = point2;
		this.RebuildOpticalElement();
	}

	GetProcessedRay(ray: Ray): Ray {
		return null;
	}
}

class Mirror extends OpticalElement {
	public GetProcessedRay(ray: Ray): Ray {
		let intersection = ray.GetIntersecion(this);
		if (intersection) {
			let normal = this.line.GetNormal(intersection);
			let angle = GetAngleBetweenLines(normal, ray.Line);
			let reflectedRay = new Ray(intersection, RotatePoint(ray.StartPoint, intersection, -2 * angle));

			return reflectedRay;
		}
		return null;
	}
	public constructor(point1: DOMPoint, point2: DOMPoint) {
		super(point1, point2);
	}
}

//focusing lens
class Lens extends OpticalElement {
	private MainOpticalAxis: Line;
	public FocusDistance: number;

	public GetProcessedRay(ray: Ray): Ray {
		let intersection = ray.GetIntersecion(this);
		if (intersection) {
			var mid = this.line.GetMidPoint();
			var ray1 = new Ray(mid, this.MainOpticalAxis.GetPointByX(0));
			var ray2 = new Ray(mid, this.MainOpticalAxis.GetPointByX(screen.width));

			var normalToAxis = this.MainOpticalAxis.GetNormal(ray.StartPoint);

			var intersectRay1 = false;

			if (normalToAxis.GetIntersection(ray1.Line)) {
				intersectRay1 = true;
			}
			else if (normalToAxis.GetIntersection(ray2.Line)) {
				intersectRay1 = false;
			}

			var distanceToLens = GetDistance(mid, normalToAxis.GetIntersection(this.MainOpticalAxis));

			var infiniteLine = new Line();
			infiniteLine.k = this.Line.k;
			infiniteLine.b = this.Line.b;

			var parallelLineToRay = ray.Line.GetParallelLine(mid);

			var focalPoint: DOMPoint = null;
			if (intersectRay1) {
				focalPoint = GetRaySegment(ray2, ray2.StartPoint, this.FocusDistance).point2;
			}
			else {
				focalPoint = GetRaySegment(ray1, ray1.StartPoint, this.FocusDistance).point2;
			}

			var normalThroughFocus = this.MainOpticalAxis.GetNormal(focalPoint);

			var pointProjection = parallelLineToRay.GetIntersection(normalThroughFocus);

			return new Ray(intersection, pointProjection);
		}
		return null;
	}
	protected RebuildOpticalElement(): void {
		this.line = this.line.RefreshLine(this.point1, this.point2);
		this.line.x1 = Math.min(this.point1.x, this.point2.x);
		this.line.x2 = Math.max(this.point1.x, this.point2.x);
		this.MainOpticalAxis = this.line.GetNormal(this.line.GetMidPoint());
	}
	public constructor(point1: DOMPoint, point2: DOMPoint) {
		super(point1, point2);
		this.FocusDistance = 100;
	}
}

const step = 1;

function ProcessRay(elements: OpticalElement[], ray: Ray): ProcessedRay {
	let processedRay = new ProcessedRay();

	processedRay.RefractionPoints = [ray.StartPoint];

	let newRay = ray;
	let segmentStartPoint = ray.StartPoint;
	let segment: { point1: DOMPoint, point2: DOMPoint } = GetRaySegment(newRay, segmentStartPoint, step);

	let lastCollideIndex = -1;

	for (; SegmentOnTheScreen(segment);) {
		segment = GetRaySegment(newRay, segmentStartPoint, step);

		let line = new Line(segment.point1, segment.point2);
		line.x1 = Math.min(segment.point1.x, segment.point2.x);
		line.x2 = Math.max(segment.point1.x, segment.point2.x);

		for (let index = 0; index < elements.length; index++) {
			if (elements[index].Line.GetIntersection(line) && lastCollideIndex != index) {
				lastCollideIndex = index;
				let procRay = elements[index].GetProcessedRay(newRay);
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