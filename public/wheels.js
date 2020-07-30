// Normal wheels class
class NormalWheels {
  constructor(robot, color = "black") {
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
      this.robot.body.position.x + this.robot.width / 2 - 15,
      this.robot.body.position.y - this.robot.height / 2 - 5,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw top-right wheel
    drawRect(
      this.robot.body.position.x + this.robot.width / 2 - 15,
      this.robot.body.position.y + this.robot.height / 2,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw bottom-left wheel
    drawRect(
      this.robot.body.position.x - this.robot.width / 2 + 5,
      this.robot.body.position.y - this.robot.height / 2 - 5,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    // Draw bottom-right wheel
    drawRect(
      this.robot.body.position.x - this.robot.width / 2 + 5,
      this.robot.body.position.y + this.robot.height / 2,
      10,
      5,
      this.robot.rotation,
      this.robot.body.position.x,
      this.robot.body.position.y
    );
    this.update();
  }
  update() {
    Body.setVelocity(this.robot.body, {
      x: Math.cos(this.robot.rotation) * this.robot.body.speed,
      y: Math.sin(this.robot.rotation) * this.robot.body.speed
    });
  }
  move(power) {
    Body.setVelocity(this.robot.body, {
      x: Math.cos(this.robot.rotation) * power,
      y: Math.sin(this.robot.rotation) * power
    });
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
  constructor(robot, color = "black") {
    super(robot, color);
    this.type = "MecanumWheels";
    this.powerX = 0;
    this.powerY = 0;
  }
  move(powerX, powerY) {
    this.powerX = powerX;
    this.powerY = powerY || 0;
  }
  stop() {
    this.powerX = 0;
    this.powerY = 0;
    this.robot.vr = 0;
  }
  update() {
    // A weird fix
    if (
      this.robot.rotation > Math.PI / 2 &&
      this.robot.rotation < (Math.PI / 2) * 3
    )
      Body.setVelocity(this.robot.body, {
        x: -this.powerX,
        y: this.powerY
      });
    else
      Body.setVelocity(this.robot.body, {
        x: this.powerX,
        y: this.powerY
      });
  }
}
