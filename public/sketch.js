var robot;
var socket;

var obstacles = [];
var collectibles = [];

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

  giveUserRandomItems();
  
  // Create the robot :)
  robot = new Robot("TestRobot", width/2, height/2, color(0,50,100));
  robot.wheels = new NormalWheels(robot);
  $("#robotName").val(robot.name);
  $("#robotColor").val(robot.color);
  //robot.parts.colorSensor = new ColorSensor(robot, "right");
  //robot.parts.distanceSensor = new DistanceSensor(robot, "front");
  
  // Make the walls around the field
  obstacles.push(new Wall(0, 0, width, 0));
  obstacles.push(new Wall(width, 0, width, height, color="red"));
  obstacles.push(new Wall(0, 0, 0, height));
  obstacles.push(new Wall(0, height, width, height));
  
  for (var i = 0; i < 10; i++)
    collectibles.push(new Collectible(random(width),random(height),10,10,(Math.random() > 0.5 ? "rect" : "ball")));
}

function draw() {
  background(0, 0, 94);
  obstacles.forEach(obstacle => obstacle.render());
  collectibles.forEach(c => c.render());
  robot.render();
}