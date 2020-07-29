
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
    Bodies = Matter.Bodies,
    Body = Matter.Body;
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
    fill(0, 0, 70);
    rect(200, height/2-45, 200, 100);

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
  
  engine = Engine.create({options: {showAngleIndicator: true,
          showVelocity: true,}});
  engine.world.gravity.y = 0;
  world = engine.world;
  
  challenge = new Challenge("skystones");
  
  // Create robot
  robot = new Robot(generateName(), 40, height/2+100, `hsl(${Math.floor(random(0,360))}, 100%, 71%)`);
  robot.wheels = new NormalWheels(robot);
  
  if (localStorage.getItem("robo_data") !== null) {
    let robodata = JSON.parse(window.localStorage.getItem("robo_data"));
    robot.name = robodata.name;
    robot.color = robodata.color;
    robot.code = robodata.code;
    editor.setValue(robot.code);
  }
  $("#robotName").val(robot.name);
  $("#robotColor").val(robot.color);
  
  
  // Create boundaries and walls
  var topWall = Bodies.rectangle(width/2, 20, width, 10, { isStatic: true});
  var leftWall = Bodies.rectangle(50, 210, 20, 300, { isStatic: true});
  var rightWall = Bodies.rectangle(width, 0, 10, height, { isStatic: true});
  var bottomWall = Bodies.rectangle(400, 350, 720, 20, { isStatic: true});
  World.add(world, [topWall, leftWall, rightWall, bottomWall]);
  
  // Add foundation?
  objects.push(new Box(width/2-50, 70, 55, 100, color(219, 91, 87)));
  objects.push(new Box(width/2+50, 70, 55, 100, color(0, 91, 87)));
  
  for (var i = 0; i < 8; i++) {
    objects.push(new Box(width/2-114, robot.body.position.y+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black"));
  }
  for (var i = 0; i < 8; i++) {
    objects.push(new Box(width/2+114, robot.body.position.y+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black"));
  }
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