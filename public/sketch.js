
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
    Body = Matter.Body,
    Events = Matter.Events;

var engine;
var world;
var topWall, rightWall, leftWall, bottomWall;

var challenge;

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
  
  // Create challenge
  challenge = collectChallenge();
  challenge.setupField();
  //window.localStorage.clear();
  
  if (window.localStorage.getItem("robo_data") !== null) {
    let robodata = JSON.parse(window.localStorage.getItem("robo_data"));
    robot = createRobotFromJSON(robodata);
    console.log(robot);
    editor.setValue(robot.code);
    var xml = Blockly.Xml.textToDom(window.localStorage.getItem("robo_code"));
    Blockly.Xml.domToWorkspace(xml, workspace);
    //editor.setValue(robot.code);
    // Set initial position
    let pos = challenge.robotInitPos[Math.random() > 0.5 ? "blue":"red"];
    console.log(pos);
    Body.setPosition(robot.body, {x: pos.x, y: pos.y});
    Body.setAngle(robot.body, pos.r);
    robot.startX = pos.x;
    robot.startY = pos.y;
    robot.startR = pos.r;
  }
  else {
    // Create new robot
    newRobot();
    let pos = challenge.robotInitPos[Math.random() > 0.5 ? "blue":"red"];
    Body.setPosition(robot.body, {x: pos.x, y: pos.y});
    Body.setAngle(robot.body, pos.r);
    robot.startX = pos.x;
    robot.startY = pos.y;
    robot.startR = pos.r;
  }
  $("#robotName").val(robot.name);
  $("#robotColor").val(robot.color);

}

function draw() {
  background(0, 0, 94);
  challenge.renderField();
  Engine.update(engine);
  challenge.objects.forEach(o => o.draw());
  robot.render();
  
  if (opponent && room) {
    opponent.render();
    // Make sure to only send it every 4 frames and when the robot is moving?
    if (socket && frameCount % 2) {
      socket.emit("sendRobotVel", {vx: robot.body.velocity.x, vy:robot.body.velocity.y, vr:robot.body.angularVelocity, room: room});
    }
  }
}