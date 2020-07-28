/*
obstacles.js
===============================================
Several components of this code were from Daniel Shiffman's 2D Ray Casting tutorial!
https://thecodingtrain.com/CodingChallenges/145-2d-ray-casting.html
https://youtu.be/TOEi6T2mtHo
*/

var collectibleColors = [
  "salmon", "gold", "lightblue", "lightgreen"
]

var redPoints = 0;
var bluePoints = 0;

var pointBoundaries = [
  {boundary:[0, 300, 200, 10], points: 10, to: "blue"},
  {boundary:[400, 300, 200, 10], points: 10, to: "red"},
]

class Wall {
  constructor(x1, y1, x2, y2, color = "black") {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.color = color;
  }

  render() {
    /* Do nothing oops */
  }
}

class Collectible {
  constructor(x, y, width, height, shape, idx, color, mass, name) {
    this.idx = idx;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.width = width;
    this.height = height;
    this.name = name;
    // For how hard it is for the robot to push it
    // Set this to infinity if this is immovable
    this.mass = mass || 100;
    
    this.vx = 0;
    this.vy = 0;
    this.shape = shape;
    if (this.shape == "rect") this.friction = 0.98;
    else this.friction = 0.99;
    this.color = color || random(collectibleColors);
    // The "walls" are the collectible's rectangular boundaries
    // The sensors use ray casting to detect objects
    this.walls = [
      new Wall(x, y, x + width, y, (color = this.color)),
      new Wall(x + width, y, x + width, y + height, (color = this.color)),
      new Wall(x, y + height, x + width, y + height, (color = this.color)),
      new Wall(x, y, x, y + height, (color = this.color))
    ];
  }
  reset() {
    this.vx = 0;
    this.vy = 0;
    this.x = this.startX;
    this.y = this.startY;
  }
  render() {
    if (this.shape == "rect") {
      fill(this.color);
      rect(this.x, this.y, this.width, this.height);
    } else if (this.shape == "ball") {
      fill(this.color);
      ellipse(this.x, this.y, this.width, this.height);
    }
    this.x += this.vx;
    this.y += this.vy;
    this.walls.forEach(w => {
      w.a.add(createVector(this.vx, this.vy));
      w.b.add(createVector(this.vx, this.vy));
    });
    
    // Make sure the objects stay inside the field
    if (this.x < 0){
         this.vx = Math.abs(this.vx) * this.friction;
         this.x = 0;
     } else if (this.x > width - this.width){
         this.vx = -Math.abs(this.vx) * this.friction;
         this.x = width - this.width;
     }
    if (this.y < 0){
         this.vy = Math.abs(this.vy) * this.friction;
         this.y = 0;
     } else if (this.y > height - this.height){
         this.vy = -Math.abs(this.vy) * this.friction;
         this.y = height - this.height;
     }
    
    this.checkCollision(robot);
    
    collectibles.forEach((c)=>{
      if (c.x != this.x && c.y != this.y) c.checkCollision(this);
    });
    
    // Set velocity to 0 if it's moving slow enough
    if (Math.abs(this.vx) < 0.02) this.vx = 0;
    if (Math.abs(this.vy) < 0.02) this.vy = 0;
    // Update the block when it is moving
    if ((this.vx != 0 || this.vy != 0) && socket)
      socket.emit("sendCollectiblePos", {
        idx: this.idx,
        x: this.x,
        y: this.y,
        color: this.color,
        room: room
      });
  }

  checkCollision(obj) {
    if (this.shape == "rect") {
      // Check with robot first
      if (
        collideRectRect(
          obj.x,
          obj.y,
          obj.width,
          obj.height,
          this.x,
          this.y,
          this.width,
          this.height
        )
      ) {
        //console.log(this.name, obj.name);
        // Physics from
        // https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
        let vCollision = {x: this.x - obj.x, y: this.y - obj.y};
        let distance = Math.sqrt((this.x-obj.x)*(this.x-obj.x) + (this.y-obj.y)*(this.y-obj.y));
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
        let vRelativeVelocity = {x: this.vx - obj.vx, y: this.vy - obj.vy};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        
        let impulse = 2 * speed / (this.mass + obj.mass);
        
        obj.vx += (impulse * this.mass * vCollisionNorm.x);
        obj.vy += (impulse * this.mass * vCollisionNorm.y);
        this.vx -= (impulse * obj.mass * vCollisionNorm.x);
        this.vy -= (impulse * obj.mass * vCollisionNorm.y);
        
      } else {
        this.vx *= this.friction;
        this.vy *= this.friction;
      }
    } else if (this.shape == "ball") {
      if (
        collideRectCircle(
          obj.x,
          obj.y,
          obj.width,
          obj.height,
          this.x,
          this.y,
          this.width
        )
      ) {
        let ovx = obj.vx;
        let ovy = obj.vy;
        obj.vx = (this.vx*this.mass) / obj.mass;
        obj.vy = (this.vy*this.mass) / obj.mass;
        this.vx = (ovx*obj.mass) / this.mass;
        this.vy = (ovy*obj.mass) / this.mass;
      } else {
        this.vx *= this.friction;
        this.vy *= this.friction;
      }
    }
  }
}
