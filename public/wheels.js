// Normal wheels class
class NormalWheels {
  constructor(robot, color="black") {
    this.type = "NormalWheels";
    this.robot = robot;
    this.color = color;
  }
  static renderOpponent(data) {
    fill(data.wheels.color);
    // Draw top-left wheel
    drawRect(
      data.x + data.width - 15,
      data.y - 5,
      10,
      5,
      data.rotation,
      data.originX,
      data.originY
    );
    // Draw top-right wheel
    drawRect(
      data.x + data.width - 15,
      data.y + data.height,
      10,
      5,
      data.rotation,
      data.originX,
      data.originY
    );
    // Draw bottom-left wheel
    drawRect(
      data.x + 5,
      data.y - 5,
      10,
      5,
      data.rotation,
      data.originX,
      data.originY
    );
    // Draw bottom-right wheel
    drawRect(
      data.x + 5,
      data.y + data.height,
      10,
      5,
      data.rotation,
      data.originX,
      data.originY
    );
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
    Body.setVelocity(this.robot.body, {x: Math.cos(this.robot.rotation) * power, y: Math.sin(this.robot.rotation) * power } )
  }
  stop() {
    // Stop everything
    this.robot.vy = 0;
    this.robot.vx = 0;
    this.robot.vr = 0;
    this.robot.power = 0;
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
    this.robot.power = (powerX + powerY)/2;
    this.robot.vy = powerY;
    this.robot.vx = powerX;
    console.log(powerX, powerY);
  }
}
