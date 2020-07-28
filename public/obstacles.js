
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/145-2d-ray-casting.html
// https://youtu.be/TOEi6T2mtHo
// 2D Ray Casting

class Wall {
  constructor(x1, y1, x2, y2, color="black") {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.color = color;
  }

  render() {
    //stroke("red");
    //line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Collectible {
  constructor(x,y,width,height,shape,idx) {
    this.idx = idx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.shape = shape;
    if (this.shape == "rect") this.friction = 0.9;
    else this.friction = 0.99;
    this.color = "lightblue";
    
    this.walls = [
      new Wall(x,y,x+width,y, color=this.color),
      new Wall(x+width,y,x+width,y+height, color=this.color),
      new Wall(x,y+height,x+width,y+height, color=this.color),
      new Wall(x,y,x,y+height, color=this.color),
    ]
  }
  
  render() {
    if (this.shape == "rect") {
      fill(this.color);
      rect(this.x,this.y,this.width,this.height);
    }
    else if (this.shape == "ball") {
      fill(this.color);
      ellipse(this.x,this.y,this.width,this.height);
    }
    //this.vx *= this.friction;
    //this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.walls.forEach(w=>{
      w.a.add(createVector(this.vx, this.vy));
      w.b.add(createVector(this.vx, this.vy));
      w.render();
    });
    
    this.checkCollision();
    // Set velocity to 0 if it's moving slow enough
    if (Math.abs(this.vx) < 0.02) this.vx = 0;
    if (Math.abs(this.vy) < 0.02) this.vy = 0;
    // Update the block when it is moving
    if ((this.vx!=0 || this.vy!=0) && socket) socket.emit("sendCollectiblePos", {idx: this.idx, x: this.x, y:this.y, color:this.color, room: room});
  }
  
  checkCollision() {
    if (this.shape == "rect") {
      if ((robot.vx != 0 || robot.vy != 0) && collideRectRect(robot.x,robot.y,robot.width,robot.height,this.x,this.y,this.width, this.height)) {
        // Transfer momentum? idk fisiks arghh
        this.color = "yellow";
        this.vx = robot.vx;
        this.vy = robot.vy;
      }
      else {
        this.color = "lightblue";
        this.vx *= this.friction;
        this.vy *= this.friction;
      }
    }
    else if (this.shape == "ball") {
      if ((robot.vx != 0 || robot.vy != 0) && collideRectCircle(robot.x,robot.y,robot.width,robot.height,this.x,this.y,this.width)) {
        this.color = "yellow";
        this.vx = robot.vx;
        this.vy = robot.vy;
      }
      else {
        this.color = "lightblue";
        this.vx *= this.friction;
        this.vy *= this.friction;
      }
    }
  }
}