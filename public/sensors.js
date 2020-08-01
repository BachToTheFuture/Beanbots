/*
sensors.js
===============================================
This file contains all the classes for sensors.
*/


class RobotPart {
  constructor(robot, side, color, width, height) {
    this.robot = robot;
    this.side = side; // Which side of the robot it's being placed
    this.width = width;
    this.height = height;
    let angles = {
      front: 0,
      left: -Math.PI / 2,
      right: Math.PI / 2,
      back: Math.PI
    };
    this.angles = angles;
    this.color = color || `hsl(${Math.floor(random(0,360))}, 100%, 71%)`;
  }
  render() {
    if (this.side == "front") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x + this.robot.width/2,
        this.robot.body.position.y - this.width/2,
        this.height,
        this.width,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "left") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x-this.width/2,
        this.robot.body.position.y - this.robot.height/2 - this.height/2,
        this.width,
        this.height,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "right") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x-this.width/2,
        this.robot.body.position.y + this.robot.height/2,
        this.width,
        this.height,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    } else if (this.side == "back") {
      fill(this.color);
      drawRect(
        this.robot.body.position.x - this.robot.width/2 - this.height/2,
        this.robot.body.position.y - this.width/2,
        this.height,
        this.width,
        this.robot.rotation,
        this.robot.body.position.x,
        this.robot.body.position.y
      );
    }
    // update values
    this.update();
    if (typeof this.color!="string") this.color= this.color.toString();
  }
  update() {}
}

class DistanceSensor extends RobotPart{
  constructor(robot, side, color = "lightgreen") {
    super(robot,side,color,10,4);
    this.type = "DistanceSensor";
    this.distance = 10000;
    this.range = 600;
  }
  update() {
    let bodies = [topWall, leftWall, bottomWall, rightWall];
    // Maybe optimize this a little?
    challenge.objects.forEach(o=>bodies.push(o.body));
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
}

/*
Color sensor
It's very similar to the distance sensor, but it gets the obstacle's color property
only when the sensor is few pixels (maybe like 50px) away from the obstacle.
*/
class ColorSensor extends DistanceSensor {
  constructor(robot, side, color = "gray") {
    super(robot,side,color);
    this.type = "ColorSensor";
    this.range = 60;
  }
  update() {
    let bodies = [];
    // Maybe optimize this a little?
    challenge.objects.forEach(o=>bodies.push(o.body));
    let start = this.robot.body.position;
    let end   = Matter.Vector.create(this.robot.body.position.x+this.range*Math.cos(this.robot.rotation+this.angles[this.side]),
                              this.robot.body.position.y+this.range*Math.sin(this.robot.rotation+this.angles[this.side]));
    let test = raycast(bodies, start, end);
    if (test.length > 0) {
      test = test[0];
      this.distance = dist(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
      this.color = test.body.color;
      push();
      stroke(this.color);
      fill(this.color);
      line(test.point.x, test.point.y, this.robot.body.position.x, this.robot.body.position.y);
      pop();
    }
  }
}