function GetDistance(point1: DOMPoint, point2: DOMPoint): number {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function GetAngleBetweenLines(line1: Line, line2: Line): number {
	var tan = (line2.k - line1.k) / (1 + line1.k * line2.k);

	return Math.atan(tan);
}

function DegToRad(angle: number) {
	return angle / Math.PI * 180;
}

class Line {
	public x1 = Number.NEGATIVE_INFINITY;
	public x2 = Number.POSITIVE_INFINITY;

	public k: number;
	public b: number;

	public XInDeterminantSpace(x: number): boolean {
		var inDeterminantSpace = false;
		if (this.x1 == Number.NEGATIVE_INFINITY) {
			if (isFinite(this.x2) && x < this.x2) {
				inDeterminantSpace = true;
			}
			else if (this.x2 == Number.POSITIVE_INFINITY) {
				inDeterminantSpace = true;
			}
		}
		else if (this.x2 == Number.POSITIVE_INFINITY) {
			if (isFinite(this.x1) && x > this.x1) {
				inDeterminantSpace = true;
			}
			else if (this.x1 == Number.NEGATIVE_INFINITY) {
				inDeterminantSpace = true;
			}
		}
		else {
			if (x > this.x1 && x < this.x2) {
				inDeterminantSpace = true;
			}
		}
		return inDeterminantSpace;
	}

	public constructor(p1: DOMPoint = null, p2: DOMPoint = null) {
		if (p1 && p2) {
			var line = this.RefreshLine(p1, p2);
			this.k = line.k;
			this.b = line.b;
		}
	}

	public RefreshLine(p1: DOMPoint, p2: DOMPoint): Line {
		var line = new Line();
		let translatedP2 = new DOMPoint(p2.x - p1.x, p2.y - p1.y);
		line.k = translatedP2.y / translatedP2.x;
		line.b = p2.y - p2.x * line.k;
		return line;
	}

	public static CreateLineByK(p1: DOMPoint, k: number): Line {
		var line = new Line();
		line.k = k;
		line.b = p1.y - p1.x * k;
		return line;
	}

	public static CreateLineByB(b: number): Line {
		var line = new Line();
		line.b = b;
		line.k = 0;
		return line;
	}

	public GetPoint(x: number): DOMPoint {
		return new DOMPoint(x, x * this.k + this.b);
	}

	public GetIntersection(line: Line): DOMPoint {
		let x = (line.b - this.b) / (this.k - line.k);

		if (line.k == this.k) {
			//lines are parallel
			return null;
		}

		if (this.XInDeterminantSpace(x) && line.XInDeterminantSpace(x)) {
			return this.GetPoint(x);
		}
		return null;
	}

	public GetNormal(point: DOMPoint): Line {
		var newK = -1 / this.k;
		return Line.CreateLineByK(point, newK);
	}

	public GetRotatedLine(angle: number, x: number): Line {
		var center = this.GetPoint(x);

		var k = (Math.tan(angle) + this.k) / (1 - Math.tan(angle) * this.k);

		var rotatedLine = Line.CreateLineByK(center, k);

		return rotatedLine;
	}

	public GetMidPoint(): DOMPoint {
		var point1 = this.GetPoint(this.x1);
		var point2 = this.GetPoint(this.x2);

		var midX = (point2.x - point1.x) / 2 + point1.x;
		var midY = (point2.y - point1.y) / 2 + point1.y;

		return new DOMPoint(midX, midY);
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
			this.line.x1 = Number.MIN_VALUE;
			this.line.x2 = this.startPoint.x;
		}
		else {
			this.line.x2 = Number.MAX_VALUE;
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

	constructor(ray: Ray) {
		this.Closed = false;
		this.RefractionPoints = [ray.StartPoint, ray.DirectionPoint];
	}
}

class OpticalElement {
	private point1: DOMPoint;
	private point2: DOMPoint;

	private RebuildOpticalElement(): void {
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

	GetProcessedRay(ray: Ray): Ray[] {
		return null;
	}
}

class Mirror extends OpticalElement {
	public GetProcessedRay(ray: Ray): Ray[] {
		let intersection = ray.GetIntersecion(this);
		if (intersection) {
			let normal = this.line.GetNormal(intersection);
			let angle = GetAngleBetweenLines(normal, ray.Line);
			let reflectedLine = normal.GetRotatedLine(-angle, intersection.x);
			if (reflectedLine.k < 0) {
				return [new Ray(intersection, normal.GetPoint(0)), new Ray(intersection, reflectedLine.GetPoint(0))];
			}
			else {
				return [new Ray(intersection, normal.GetPoint(screen.width)), new Ray(intersection, reflectedLine.GetPoint(screen.width))];
			}
		}
		return null;
	}
	public constructor(point1: DOMPoint, point2: DOMPoint) {
		super(point1, point2);
	}
}