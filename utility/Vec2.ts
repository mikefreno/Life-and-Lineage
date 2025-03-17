export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static from(point: { x: number; y: number }): Vector2 {
    return new Vector2(point.x, point.y);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2 {
    if (scalar === 0) throw new Error("Division by zero");
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  // Get the magnitude (length) of this vector
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Get the squared magnitude (useful for comparisons without sqrt)
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  // Normalize this vector (make it unit length)
  normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2();
    return this.divide(mag);
  }

  // Calculate the distance to another vector
  distance(v: Vector2): number {
    return this.subtract(v).magnitude();
  }

  // Calculate the squared distance to another vector
  distanceSquared(v: Vector2): number {
    return this.subtract(v).magnitudeSquared();
  }

  // Linear interpolation between this vector and another
  lerp(v: Vector2, t: number): Vector2 {
    return new Vector2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
    );
  }

  // Get the midpoint between this vector and another
  midpoint(v: Vector2): Vector2 {
    return this.lerp(v, 0.5);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  // Calculate angle in degrees
  angleDegrees(): number {
    return Math.atan2(this.y, this.x) * (180 / Math.PI);
  }

  // Calculate angle between this vector and another
  angleBetween(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  // Calculate angle between this vector and another in degrees
  angleBetweenDegrees(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x) * (180 / Math.PI);
  }

  // Create a vector from angle and magnitude
  static fromAngle(angle: number, magnitude: number = 1): Vector2 {
    return new Vector2(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude,
    );
  }

  // Rotate a vector by an angle (in radians)
  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos,
    );
  }

  // Get perpendicular vector (90 degrees rotation)
  perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  // Dot product
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  // Cross product (returns scalar for 2D vectors)
  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  // Project this vector onto another vector
  project(v: Vector2): Vector2 {
    const magnitude = v.magnitude();
    if (magnitude === 0) return new Vector2();
    const scalar = this.dot(v) / magnitude;
    return v.normalize().multiply(scalar);
  }

  // Reflect this vector off a surface with normal vector n
  reflect(normal: Vector2): Vector2 {
    const n = normal.normalize();
    return this.subtract(n.multiply(2 * this.dot(n)));
  }

  // Limit the magnitude of this vector
  limit(max: number): Vector2 {
    const mSq = this.magnitudeSquared();
    if (mSq > max * max) {
      return this.normalize().multiply(max);
    }
    return this.clone();
  }

  // Convert to object with x,y properties (useful for React Native Animated)
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // Create a vector with random direction and specified magnitude
  static random(magnitude: number = 1): Vector2 {
    const angle = Math.random() * Math.PI * 2;
    return Vector2.fromAngle(angle, magnitude);
  }

  // Interpolate between vectors with easing
  static lerpWithEasing(
    start: Vector2,
    end: Vector2,
    t: number,
    easingFn: (t: number) => number,
  ): Vector2 {
    return start.lerp(end, easingFn(t));
  }

  // Calculate a point on a quadratic bezier curve
  static quadraticBezier(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    t: number,
  ): Vector2 {
    const q0 = p0.lerp(p1, t);
    const q1 = p1.lerp(p2, t);
    return q0.lerp(q1, t);
  }

  // Calculate a point on a cubic bezier curve
  static cubicBezier(
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
    t: number,
  ): Vector2 {
    const q0 = p0.lerp(p1, t);
    const q1 = p1.lerp(p2, t);
    const q2 = p2.lerp(p3, t);

    const r0 = q0.lerp(q1, t);
    const r1 = q1.lerp(q2, t);

    return r0.lerp(r1, t);
  }
}
