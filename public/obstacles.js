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
  constructor(x, y, width, height, shape, idx, color, mass) {
    this.idx = idx;
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.width = width;
    this.height = height;
    // For how hard it is for the robot to push it
    // Set this to infinity if this is immovable
    this.mass = mass || 1;
    
    this.vx = 0;
    this.vy = 0;
    this.shape = shape;
    if (this.shape == "rect") this.friction = 0.9;
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
    this.x = this.originX;
    this.y = this.originY;
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
    
    this.checkCollision(robot);
    
    collectibles.forEach((c,i)=>{
      if (i != this.idx) c.checkCollision(this);
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
        // Transfer momentum? physics is off here sorry :(
        let vCollision = {x: this.x - obj.x, y: this.y - obj.y};
        let distance = Math.sqrt((this.x-obj.x)*(this.x-obj.x) + (this.y-obj.y)*(this.y-obj.y));
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
        let vRelativeVelocity = {x: this.vx - obj.vx, y: this.vy - obj.vy};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        
        obj.vx += (speed * vCollisionNorm.x);
        obj.vy += (speed * vCollisionNorm.y);
        this.vx += (speed * vCollisionNorm.x);
        this.vy += (speed * vCollisionNorm.y);
        
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
