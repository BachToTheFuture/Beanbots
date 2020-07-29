/*
robot.js
===============================================
The main class that contains the robot body and
its accessories and components.
*/

/*
class Robot {
  constructor(name, x, y, color) {
    this.name = name;
    this.wheels;
    this.parts = {};

    // Initial positions
    this.startX = x;
    this.startY = y;
    this.startR = 0;
    this.friction = 1;
    
    // The robot's mass
    this.mass = 100;
    
    // The preprogrammed instructions
    this.code = "";
    // Color
    this.color = color;
    this.textColor = "white";
    // Size
    this.width = 50;
    this.height = 40;
    // Position and velocity
    this.x = x;
    this.y = y;
    // Robot's centers
    this.originX = this.x + this.width / 2;
    this.originY = this.y + this.height / 2;
    // Velocities and power
    this.power = 0;
    this.vx = 0;
    this.vy = 0;
    this.vr = 0; // rotation speed;
    this.rotation = 0; // robot rotation in radians
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
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.vr = 0;
    this.rotation = this.startR;
  }
  render() {
    // Draw the wheels first, then the body, then everything else
    this.wheels.render();
    // Draw body
    fill(this.color);
    drawRect(this.x, this.y, this.width, this.height, this.rotation);
    // Draw the rest of the bot's stuff
    Object.keys(this.parts).forEach(part => this.parts[part].render());
    // Move robot
    this.y += this.vy;
    this.x += this.vx;
    // Update rotation
    this.rotation += this.vr;
    // Update the robot's axis
    this.originX = this.x + this.width / 2;
    this.originY = this.y + this.height / 2;
    // Update velocity components depending on the robot's angle
    
    if (this.wheels.type == "NormalWheels") {
      this.vy = Math.sin(this.rotation) * this.power;
      this.vx = Math.cos(this.rotation) * this.power;
    }
    
    // Draw the robot's name
    textAlign(CENTER);
    textStyle(BOLD);
    fill(this.textColor);
    strokeWeight(0);
    text(this.name, this.x + this.width / 2, this.y - 20);
    strokeWeight(2);
    
    // Make sure the robot stay inside the field
    if (this.x < 0){
         this.vx *= this.friction;
         this.x = 0;
     } else if (this.x > width - this.width){
         this.vx *= this.friction;
         this.x = width - this.width;
     }
    if (this.y < 0){
         this.vy *= this.friction;
         this.y = 0;
     } else if (this.y > height - this.height){
         this.vy *= this.friction;
         this.y = height - this.height;
     }
  }
  
  checkCollision() {
    if (collideLineRect(
        0, height, width, height
        robot.x,
        robot.y,
        robot.width,
        robot.height,
      ) || ) {
      
    }
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
*/

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/urR596FsU68
class Box {
  constructor(x, y, w, h, color) {
    var options = {
      friction: 0.3,
      restitution: 0.6
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.width = w;
    this.height = h;
    this.color = color;
    this.rotation = 0;
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
  }
  render() {
    this.wheels.render();
    this.draw();
    
    // Draw the robot's name
    textAlign(CENTER);
    textStyle(BOLD);
    fill(this.textColor);
    strokeWeight(0);
    text(this.name, this.body.position.x, this.body.position.y - 40);
    strokeWeight(2);
  }
}