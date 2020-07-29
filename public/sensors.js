/*
sensors.js
===============================================
This file contains all the classes for sensors.
*/

class DistanceSensor {
  constructor(robot, side, color = "lightgreen") {
    this.type = "DistanceSensor";
    this.robot = robot;
    this.side = side; // Which side of the robot it's being placed
    this.distance = 0;
    let angles = {
      front: 0,
      left: -Math.PI / 2,
      right: Math.PI / 2,
      back: Math.PI
    };
    this.angles = angles;
    this.ray = new Ray(
      createVector(this.robot.originX, this.robot.originY),
      angles[side]
    );
    this.pos = createVector(this.robot.originX, this.robot.originY);
    this.color = color;
  }
  render() {
    this.pos.set(this.robot.originX, this.robot.originY);
    if (this.side == "front") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x + this.robot.width/2,
        this.robot.body.position.y - 5,
        4,
        10,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "left") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x,
        this.robot.body.position.y - this.robot.height/2 - 2,
        10,
        4,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "right") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x,
        this.robot.body.position.y + this.robot.height/2+2,
        10,
        4,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "back") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x - this.robot.width/2 - 2,
        this.robot.body.position.y,
        4,
        10,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    }
    // Update the distance sensor beam
    //this.ray.show();
    this.get();
  }
  get() {
    let bodies = [];
    objects.forEach(o=>bodies.push(o.body));
    let start = this.robot.body.position;
    let end   = Matter.Vector.create(this.robot.body.position.x+width*Math.cos(this.robot.rotation+this.angles[this.side]),
                              this.robot.body.position.y+width*Math.sin(this.robot.rotation+this.angles[this.side]));
    let test = raycast(bodies, start, end);
    if (test.length > 0) {
      test = test[0];
      this.distance = dist(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
      line(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
    }
  }

  until(condition, callback) {
    // Wait until the sensor gets a certain distance
    let t = this;
    return new Promise(resolve => {
      var l = setInterval(() => {
        // Call callback function
        if (callback) callback(t.distance);
        // Have a little leeway for error
        if (condition(t.distance)) {
          resolve();
          clearTimeout(l);
          return;
        }
      }, 250);
    });
  }
}

/*
Color sensor
It's very similar to the distance sensor, but it gets the obstacle's color property
only when the sensor is few pixels (maybe like 50px) away from the obstacle.
*/
class ColorSensor {
  constructor(robot, side, color = "gray") {
    this.type = "ColorSensor";
    this.robot = robot;
    this.side = side; // Which side of the robot it's being placed
    this.distance = 0;
    let angles = {
      front: 0,
      left: -Math.PI / 2,
      right: Math.PI / 2,
      back: Math.PI
    };
    this.ray = new Ray(
      createVector(this.robot.originX, this.robot.originY),
      angles[side]
    );
    this.pos = createVector(this.robot.originX, this.robot.originY);
    this.color = color;
  }
  render() {
    this.pos.set(this.robot.originX, this.robot.originY);
    if (this.side == "front") {
      fill(this.color);
      drawRect(
        this.robot.x + this.robot.width,
        this.robot.y + this.robot.height / 2 - 5,
        4,
        10,
        this.robot.rotation,
        this.robot.originX,
        this.robot.originY
      );
    } else if (this.side == "left") {
      fill(this.color);
      drawRect(
        this.robot.x + this.robot.width / 2 - 5,
        this.robot.y - 4,
        10,
        4,
        this.robot.rotation,
        this.robot.originX,
        this.robot.originY
      );
    } else if (this.side == "right") {
      fill(this.color);
      drawRect(
        this.robot.x + this.robot.width / 2 - 5,
        this.robot.y + this.robot.height,
        10,
        4,
        this.robot.rotation,
        this.robot.originX,
        this.robot.originY
      );
    } else if (this.side == "back") {
      fill(this.color);
      drawRect(
        this.robot.x - 4,
        this.robot.y + this.robot.height / 2 - 5,
        4,
        10,
        this.robot.rotation,
        this.robot.originX,
        this.robot.originY
      );
    }
    // Update the sensor beam
    this.ray.show();
    this.get();
  }

  get() {
    const ray = this.ray;
    let closest = null;
    let record = Infinity;
    let closestColor;
    for (let c of collectibles) {
      c.walls.forEach(w => {
        const pt = ray.cast(w);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
            closestColor = w.color;
          }
        }
      });
    }
    if (closest) {
      this.distance = dist(this.pos.x, this.pos.y, closest.x, closest.y);
      if (this.distance < 50) {
        this.color = closestColor;
        push();
        stroke(this.color);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
        pop();
      } else this.color = "gray";
    }
  }
  until(condition, callback) {
    // Wait until the sensor gets a certain color
    let t = this;
    return new Promise(resolve => {
      var l = setInterval(() => {
        // Call callback function
        if (callback) callback(t.color);
        // Have a little leeway for error
        if (condition(t.color)) {
          resolve();
          clearTimeout(l);
          return;
        }
      }, 250);
    });
  }
}
