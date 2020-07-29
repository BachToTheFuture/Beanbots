// Normal wheels class
class NormalWheels {
  constructor(robot, color="black") {
    this.type = "NormalWheels";
    this.robot = robot;
    this.color = color;
  }
  render() {
    // This function draws four wheels on the robot.
    // All wheels are drawn in relative to the robot's position
    fill(this.color);
    // Draw top-left wheel
    drawRect(
      this.robot.body.position.x + this.robot.width/2 - 15,
      this.robot.body.position.y - this.robot.height/2 - 5,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw top-right wheel
    drawRect(
      this.robot.body.position.x + this.robot.width/2 - 15,
      this.robot.body.position.y + this.robot.height/2,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw bottom-left wheel
    drawRect(
      this.robot.body.position.x - this.robot.width/2 + 5,
      this.robot.body.position.y - this.robot.height/2 - 5,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw bottom-right wheel
    drawRect(
      this.robot.body.position.x - this.robot.width/2 + 5,
      this.robot.body.position.y + this.robot.height/2,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
  }
  move(power) {
    Body.setVelocity(this.robot.body, {x: Math.cos(this.robot.rotation) * power, y: Math.sin(this.robot.rotation) * power });
  }
  stop() {
    // Stop everything
    Body.setVelocity(this.robot.body, {
      x: 0,
      y: 0
    });
    this.robot.vr = 0;
  }
  rotate(power) {
    this.robot.vr = power / 10;
  }
}

// Add mecanum wheels
class MecanumWheels extends NormalWheels {
  constructor(robot, color="black") {
    super(robot, color);
    this.type = "MecanumWheels";
  }
  move(powerX, powerY) {
    Body.setVelocity(this.robot.body, {
      x: powerX,
      y: powerY || 0
    });
  }
}
