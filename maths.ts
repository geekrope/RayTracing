function GetDistance(point1: DOMPoint, point2: DOMPoint): number {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function GetAngleBetweenLines(line1: Line, line2: Line): number {
	return 0;
}

function GetAngleBetweenLineAndHorizon(line1: Line, y: number): number {
	var horizon = Line.CreateLineByB(y);
	var intersection = horizon.GetIntersection(line1);
	if (!intersection) {
		return Math.PI;
	}
	else {
		var x0Point = line1.GetPoint(0);
		var dist = GetDistance(new DOMPoint(0, 0), x0Point);

		var angle = Math.acos((x0Point.x - intersection.x) / dist);

		return angle;
	}
}

class Line {
	public x1 = Number.MIN_VALUE;
	public x2 = Number.MAX_VALUE;

	public k: number;
	public b: number;

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
		line.b = translatedP2.y - translatedP2.x * this.k;
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
		let x = (line.b - this.b) / (line.k - this.k);

		if (line.k == this.k) {
			//lines are parallel
			return null;
		}

		if (x > line.x1 && x < line.x2 && x > this.x1 && x < this.x2) {
			return this.GetPoint(x);
		}
		return null;
	}

	public GetNormal(point: DOMPoint): Line {
		var newK = -1 / this.k;
		return Line.CreateLineByK(point, newK);
	}

	public GetRotatedLine(angle: number): Line {
		return new Line();
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
		this.line.RefreshLine(this.startPoint, this.directionPoint);
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
	}

	public GetIntersecion(element: OpticalElement): DOMPoint {
		return new Line(element.Point1, element.Point2).GetIntersection(this.line);
	}
}

class ProcessedRay {
	public RefractionPoints: DOMPoint[];
	public Closed: boolean;
}

class OpticalElement {
	private point1: DOMPoint;
	private point2: DOMPoint;

	protected line: Line;

	public get Point1(): DOMPoint {
		return this.point1;
	}
	public get Point2(): DOMPoint {
		return this.point1;
	}

	public set Point1(value: DOMPoint) {
		this.point1 = value;
		this.line.RefreshLine(this.point1, this.point2);
	}
	public set Point2(value: DOMPoint) {
		this.point2 = value;
		this.line.RefreshLine(this.point1, this.point2);
	}

	GetProcessedRay(ray: Ray): Ray {
		return null;
	}
}

class Mirror extends OpticalElement {
	public GetProcessedRay(ray: Ray): Ray {
		let intersection = ray.GetIntersecion(this);
		let normal = this.line.GetNormal(intersection);
		return new Ray(new DOMPoint(), new DOMPoint());
	}
	public constructor() {
		super();
		this.line = new Line();
	}
}