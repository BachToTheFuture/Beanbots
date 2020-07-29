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
    this.range = 600;
    let angles = {
      front: 0,
      left: -Math.PI / 2,
      right: Math.PI / 2,
      back: Math.PI
    };
    this.angles = angles;
    this.color = color;
    // Beam comes out of distance sensor
  }
  render() {
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
        this.robot.body.position.x-5,
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
        this.robot.body.position.x-5,
        this.robot.body.position.y + this.robot.height/2,
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
        this.robot.body.position.y - 5,
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
    // Maybe optimize this a little?
    objects.forEach(o=>bodies.push(o.body));
    let start = this.robot.body.position;
    let end   = Matter.Vector.create(this.robot.body.position.x+this.range*Math.cos(this.robot.rotation+this.angles[this.side]),
                              this.robot.body.position.y+this.range*Math.sin(this.robot.rotation+this.angles[this.side]));
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
class ColorSensor extends DistanceSensor {
  get() {
    let bodies = [];
    // Maybe optimize this a little?
    objects.forEach(o=>bodies.push(o.body));
    let start = this.robot.body.position;
    let end   = Matter.Vector.create(this.robot.body.position.x+this.range*Math.cos(this.robot.rotation+this.angles[this.side]),
                              this.robot.body.position.y+this.range*Math.sin(this.robot.rotation+this.angles[this.side]));
    let test = raycast(bodies, start, end);
    if (test.length > 0) {
      test = test[0];
      this.distance = dist(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
      if (this.distance < 60) {
        console.log(test.body);
        // Getting the wrong color!
        this.color = test.body.render.fillStyle;
        push();
        stroke(this.color);
        line(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
        pop();
      }
    }
  }
}