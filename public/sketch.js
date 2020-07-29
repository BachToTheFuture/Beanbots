
/*
sketch.js
===============================================
This is essentially the main JS file
*/  

var allSensors = [
  "ColorSensor", "DistanceSensor"
]
var allWheels = [
  "NormalWheels", "MecanumWheels"
]

var userSensors = [];
var userWheels = [];

var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var world;
var objects = [];

var challenge;

class Challenge {
  constructor(name) {
    this.name = name;
    // Scores and point boundaries all go in here
  }
  renderField() {
    background(0,0,80);

    // blue? bridge
    fill(219, 91, 87);
    rect(0, 300, 200, 10); 

    // red? bridge?
    fill(0,91, 87);
    rect(400, 300, 200, 10);

    // big bridge
    fill(0, 0, 25);
    rect(200, height/2-50, 200, 100);

    //how to get the yellow line to show above black 
    fill(65, 85, 100);
    rect(200, 300, 200, 10);

    push();
    noFill();
    strokeWeight(4);
    stroke(0, 91, 87);
    square(-5, height-75, 80);
    pop();

    push();
    noFill();
    strokeWeight(4);
    stroke(219, 91, 87);
    square(width-75, height-75, 80);
    pop();
  }
}


function setup() {
  colorMode(HSB, 360, 100, 100);
  let canvas = createCanvas(600,600);
  strokeWeight(2);
  canvas.parent("canvas");
  background(0, 0, 94);
  
  // Give the user a random item from each category 
  giveUserRandomItems();
  
  engine = Engine.create();
  engine.world.gravity.y = 0;
  world = engine.world;
  
  challenge = new Challenge("skystones");
  
  // Create robot
  robot = new Robot(generateName(), 40, height/2+100, `hsl(${Math.floor(random(0,360))}, 100%, 71%)`);
  robot.wheels = new NormalWheels(robot);
  
  objects.push(new Box(225, 20, 55, 100, color(219, 91, 87)));
  objects.push(new Box(325, 20, 55, 100, color(0, 91, 87)));
  
  // Create the 
}

function draw() {
  background(0, 0, 94);
  challenge.renderField();
  Engine.update(engine);
  objects.forEach(o => o.draw());
  robot.render();
  
  if (opponent && room) {
    robotRender(opponent);
    // Make sure to only send it every 4 frames and when the robot is moving?
    if (socket && frameCount % 2) {
      socket.emit("sendRobotPos", {x: robot.x, y:robot.y, originX: robot.originX, originY: robot.originY, rotation:robot.rotation, room: room});
    }
  }
}