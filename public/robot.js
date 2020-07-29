/*
robot.js
===============================================
The main class that contains the robot body and
its accessories and components.
*/

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/urR596FsU68
class Box {
  constructor(x, y, w, h, color) {
    var options = {
      friction: 100,
      restitution: 0,
      mass: 1,
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.width = w;
    this.height = h;
    // Color
    this.color = color;
    this.body.color = color;
    
    this.rotation = 0;
    this.vr = 0; // Rotation speed
    // Original positions
    this.startX = x;
    this.startY = y;
    this.startR = 0;
    
    World.add(world, this.body);
  }
  
  draw() {
    var pos = this.body.position;
    this.rotation = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(this.rotation);
    rectMode(CENTER);
    fill(this.color);
    rect(0, 0, this.width, this.height);
    pop();
    if (typeof this.color!="string") this.color= this.color.toString();
  }
}

class Robot extends Box {
  constructor(name, x, y, color) {
    super(x, y, 50, 40, color);
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
    console.log(this);
  }
  run() {
    let code = this.code;
    const AsyncFunction = Object.getPrototypeOf(async function() {})
      .constructor;
    // Redefine global variables as undefined so users don't access them and mess around with it
    let fn = new AsyncFunction(
      "robot",
      "var editor, drawRect, Wall, Ray, Robot, DistanceSensor, obstacles, draw, setup, NormalWheels, document, eval, window;\n" +
        code
    );
    (() => {
      fn(this);
    })();
  }
  reset() {
    Body.setPosition(this.body, {x: this.startX, y:this.startY})
    this.rotation = this.startR;
    Body.setAngle(this.body, this.rotation);
    Body.setVelocity(this.body, {x:0, y:0});
  }
  render() {
    this.wheels.render();
    this.draw();
    
    Object.values(this.parts).forEach(part => part.render());
    
    if (this.wheels.type == "NormalWheels")
      Body.setVelocity(this.body, {
        x: Math.cos(this.rotation) * this.body.speed,
        y: Math.sin(this.rotation) * this.body.speed
      });
    /*
    Take a look at this
    else if (this.wheels.type == "MecanumWheels")
      Body.setVelocity(this.body, {
        x: this.body.speed,
        y: this.body.speed
      });
      */
    Body.setAngularVelocity(this.body, this.vr);
    
    // Draw the robot's name
    textAlign(CENTER);
    textStyle(BOLD);
    fill(this.textColor);
    strokeWeight(0);
    text(this.name, this.body.position.x, this.body.position.y - 40);
    strokeWeight(2);
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}