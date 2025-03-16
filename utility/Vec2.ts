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

  // Calculate the dot product with another vector
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  // Calculate the angle between this vector and another (in radians)
  angle(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  // Calculate the angle between this vector and another (in degrees)
  angleDegrees(v: Vector2): number {
    return this.angle(v) * (180 / Math.PI);
  }

  // Rotate this vector by an angle (in radians)
  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos,
    );
  }

  // Rotate this vector by an angle (in degrees)
  rotateDegrees(angle: number): Vector2 {
    return this.rotate(angle * (Math.PI / 180));
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

  // Convert to an object with x and y properties
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  // Calculate the center point of a rectangle with this vector as dimensions
  center(): Vector2 {
    return new Vector2(this.x / 2, this.y / 2);
  }

  // Check if this vector is equal to another
  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  // Convert to a string representation
  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  // Calculate a point that is offset from this vector by width and height
  offset(width: number, height: number): Vector2 {
    return new Vector2(this.x + width, this.y + height);
  }

  // Calculate a point that is offset from this vector by half width and height
  offsetByHalf(width: number, height: number): Vector2 {
    return new Vector2(this.x - width / 2, this.y - height / 2);
  }

  // Project this vector onto another vector
  project(v: Vector2): Vector2 {
    const normalized = v.normalize();
    const scalar = this.dot(normalized);
    return normalized.multiply(scalar);
  }

  // Get a vector perpendicular to this one
  perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  // Calculate the reflection of this vector off a surface with normal n
  reflect(n: Vector2): Vector2 {
    const normalized = n.normalize();
    return this.subtract(normalized.multiply(2 * this.dot(normalized)));
  }
}
