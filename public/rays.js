/*
rays.js
===============================================
This entire file is from Daniel Shiffman's 2D Ray Casting tutorial!
https://thecodingtrain.com/CodingChallenges/145-2d-ray-casting.html
https://youtu.be/TOEi6T2mtHo
*/

class Ray {
  constructor(pos, shiftAngle) {
    this.pos = createVector(robot.originX, robot.originY);
    this.dir = p5.Vector.fromAngle(robot.rotation);
    // shift in angle
    this.shiftAngle = shiftAngle;
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
    this.dir = p5.Vector.fromAngle(robot.rotation+this.shiftAngle);
  }

  show() {
    this.pos.set(robot.originX, robot.originY);
    this.dir = p5.Vector.fromAngle(robot.rotation+this.shiftAngle);
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

