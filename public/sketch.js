
/*
sketch.js
===============================================
This is essentially the main JS file
*/  

var allSensors = [
  "ColorSensor", "DistanceSensor"
]
var allWheels = [
  "NormalWheels"
]

var userSensors = [];
var userWheels = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  let canvas = createCanvas(600,600);
  canvas.parent("canvas");
  background(0, 0, 94);
  
  // Give the user a random item from each category 
  giveUserRandomItems();
  
  // Create robot
  robot = new Robot(generateName(), width/2 - 150, height/2, `hsl(${Math.floor(random(0,360))}, 100%, 71%)`);
  robot.wheels = new NormalWheels(robot);
  
  // Try restoring saved robot data
  if (localStorage.getItem("robo_data") !== null) {
    let robodata = localStorage.getItem("robo_data");
    robot.name = robodata.name;
    robot.color = robodata.color;
    robot.code = robodata.code;
    editor.setValue(robot.code);
  }
  $("#robotName").val(robot.name);
  $("#robotColor").val(robot.color);
  
  /*
  // Make the walls around the field
  obstacles.push(new Wall(0, 0, width, 0));
  obstacles.push(new Wall(width, 0, width, height, color="red"));
  obstacles.push(new Wall(0, 0, 0, height));
  obstacles.push(new Wall(0, height, width, height));
  */
  
  for (var i = 0; i < 10; i++)
    collectibles.push(new Collectible(random(width-20),random(height-20),10,10,(Math.random() > 0.5 ? "rect" : "ball"), i));
}

function draw() {
  background(0, 0, 94);
  drawField();
  //obstacles.forEach(obstacle => obstacle.render());
  collectibles.forEach(c => c.render());
  robot.render();
  if (opponent && room) {
    robotRender(opponent);
    // Make sure to only send it every 4 frames and when the robot is moving?
    if (socket) {
      socket.emit("sendRobotPos", {x: robot.x, y:robot.y, originX: robot.originX, originY: robot.originY, rotation:robot.rotation, room: room});
    }
  }
}

function drawField() {
  background(219, 7, 42);
  fill(219, 91, 87);
  rect(225, 20, 55, 100);
  
  fill(0, 91, 87);
  rect(325, 20, 55, 100);
  
  fill(219, 91, 87);
  rect(0, 300, 200, 10); 
  
  fill(0,91, 87);
  rect(400, 300, 200, 10);
  
  fill(0, 0, 0);
  rect(200, 270, 200, 100);
}