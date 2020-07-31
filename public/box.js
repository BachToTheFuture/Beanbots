// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/urR596FsU68
class Box {
  constructor(x, y, w, h, color, type) {
    var options = {
      friction: 1,
      frictionAir: 0.6,
      restitution: 0,
      mass: 1,
    }
    this.type = type;
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.body.role = type;
    // This will be set to 0 when the points are used up
    this.body.pointMultiplier = 1;
    
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
  reset() {
    Body.setPosition(this.body, {x: this.startX, y:this.startY})
    this.rotation = this.startR;
    Body.setAngle(this.body, this.rotation);
    Body.setVelocity(this.body, {x:0, y:0});
    this.vr = 0;
    Body.setAngularVelocity(this.body, 0);
    this.body.pointMultiplier = 1;
    if (this.wheels) this.wheels.stop();
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