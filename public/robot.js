// Main robot class: this is the robot body
class Robot {
  constructor(name, x, y, color) {
    this.name = name;
    this.wheels;
    this.parts = {};
    // The preprogrammed instructions
    this.code = "";
    // Color
    this.color = color;
    // Size
    this.width = 50;
    this.height = 40;
    // Position and velocity
    this.x = x;
    this.y = y;
    // Robot's centers
    this.originX = this.x+this.width/2;
    this.originY = this.y+this.height/2;
    // Velocities and power
    this.power = 0;
    this.vx = 0;
    this.vy = 0;
    this.vr = 0; // rotation speed;
    this.rotation = 0; // robot rotation in radians
  }
  run() {
    let code = this.code;
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    // Redefine global variables as undefined so users don't access them and mess around with it
    let fn = new AsyncFunction("robot","var editor, drawRect, Wall, Ray, Robot, DistanceSensor, obstacles, draw, setup, NormalWheels;\n"+code);
    (() => {
      fn(this);
    })();
  }
  render() {
    // Draw the wheels first, then the body, then everything else
    this.wheels.render();
    // Draw body
    fill(this.color);
    drawRect(this.x, this.y, this.width, this.height, this.rotation);
    // Draw the rest of the bot's stuff
    Object.keys(this.parts).forEach((part) => this.parts[part].render());
    // Move robot
    this.y += this.vy;
    this.x += this.vx;
    
    this.rotation += this.vr;
    this.originX = this.x+this.width/2;
    this.originY = this.y+this.height/2;
    
    // Update velocities depending on the robot's angle
    // idk fisiks lol
    this.vy = Math.sin(this.rotation) * this.power;
    this.vx = Math.cos(this.rotation) * this.power;
    
    // Draw the robot's name
    textAlign(CENTER);
    textStyle(BOLD);
    fill("black");
    strokeWeight(0);
    text(this.name, this.x+this.width/2, this.y-20);
    strokeWeight(2);
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}