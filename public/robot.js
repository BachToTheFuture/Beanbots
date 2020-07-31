/*
robot.js
===============================================
The main class that contains the robot body and
its accessories and components.
*/

class Robot extends Box {
  constructor(name, x, y, color) {
    super(x, y, 50, 40, color, "robot");
    this.name = name;
    this.wheels;
    this.parts = {};
    // The preprogrammed instructions
    this.code = "";
    // The color of the robot's name
    this.textColor = "black";
    // Set robot mass and remove friction as we want the robot to go forever
    this.body.mass = 100;
    this.body.friction = 0;
    this.body.frictionAir = 0;
    this.body.frictionStatic = 0;
    this.body.restitution = 0.3
    // Debug purposes
  }
  run() {
    let code = this.code;
    const AsyncFunction = Object.getPrototypeOf(async function() {})
      .constructor;
    // Redefine global variables as undefined so users don't access them and mess around with it
    let fn = new Function(
      "robot",
      "var editor, drawRect, Wall, Ray, Robot, DistanceSensor, obstacles, draw, setup, NormalWheels, document, eval, window;\n(" +
        this.code+")()"
    );
    
    console.log(this.code);
    (() => {
      fn(this);
    })();
  }
  render() {
    this.wheels.render();
    this.draw();
    
    Object.values(this.parts).forEach(part => part.render());
    
    /*
    Take a look at this
    else if (this.wheels.type == "MecanumWheels")
      Body.setVelocity(this.body, {
        x: this.body.speed,
        y: this.body.speed
      });
      */
    Body.setAngularVelocity(this.body, this.vr);
    this.rotation = this.body.angle;
    // Draw the robot's name
    textAlign(CENTER);
    textStyle(BOLD);
    fill(this.textColor);
    strokeWeight(0);
    text(this.name, this.body.position.x, this.body.position.y - 40);
    strokeWeight(2);
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(()=>{
      resolve();
      this.wheels.stop();
    }, ms));
  }
  until(condition) {
    return new Promise(resolve => {
        var l = setInterval(() => {
          if (condition()) {
            resolve();
            this.wheels.stop();
            if (this.parts.distanceSensor) this.parts.distanceSensor.distance = 100000;
            if (this.parts.colorSensor) this.parts.colorSensor.color = "gray";
            clearTimeout(l);
            return;
          }
        }, 250);
    });
  }
}