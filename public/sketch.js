
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
var objects = [];
var topWall, rightWall, leftWall, bottomWall;

var challenge;

function newRobot() {
  robot = new Robot(generateName(), 40, height/2+100, `hsl(${Math.floor(random(0,360))}, 100%, 71%)`);
  robot.wheels = new NormalWheels(robot);
  var workspaceBlocks = document.getElementById("workspaceBlocks"); 
  Blockly.Xml.domToWorkspace(workspaceBlocks, workspace);

  robot.code = Blockly.JavaScript.workspaceToCode(workspace).slice(9); // slice out beginning comments
  robot.code = `/*
USEFUL FUNCTIONS TO HELP YOU GET STARTED
=============================================
robot.wheels.move(vx, [vy only for MecanumWheels])
  - move robot with the given velocities
  - ex: robot.wheels.move(2)   // moving straight
        robot.wheels.move(2,2) // moving diagonally

await robot.wait(miliseconds)
  - wait for several miliseconds before
    stopping the robot
  - ex: // Let the robot move for one second
        robot.wheels.move(2);
        await robot.wait(1000);

await robot.until(()=>(condition))
  - wait until condition is fulfilled then
    stop the robot
  - ex: // Move until robot is less than 50 pixels away
        // from an obstacle
        robot.wheels.move(2);
        await robot.until(()=>(
          robot.parts.distanceSensor.distance < 50
        ))
*/
async ` + robot.code;
  editor.setValue(robot.code);
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
  }
  else {
    // Create new robot
    newRobot();
  }
  $("#robotName").val(robot.name);
  $("#robotColor").val(robot.color);
  
  // Awarding scores
  Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];
        //if (pair.bodyA.role === "line" || pair.bodyB.role === "line") console.log(pair);
        if (pair.bodyA.role === "line" && pair.bodyB.role === "stone" && pair.bodyB.pointMultiplier > 0) {
          let points = pair.bodyA.points;
          if (pair.bodyB.color == "black") points *= 2;
          if (pair.bodyA.to == "blue") challenge.bluePoints += points * pair.bodyB.pointMultiplier;
          else challenge.redPoints += pair.bodyA.points * pair.bodyB.pointMultiplier;
          console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
          pair.bodyB.pointMultiplier--;
        }
        else if (pair.bodyB.role === "line" && pair.bodyA.role === "stone" && pair.bodyA.pointMultiplier > 0) {
          let points = pair.bodyB.points;
          if (pair.bodyA.color == "black") points *= 2;
          if (pair.bodyB.to == "blue") challenge.bluePoints += points * pair.bodyA.pointMultiplier;
          else challenge.redPoints += pair.bodyB.points * pair.bodyA.pointMultiplier;
          console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
          pair.bodyA.pointMultiplier--;
        }
    }
});
}

function draw() {
  background(0, 0, 94);
  challenge.renderField();
  Engine.update(engine);
  objects.forEach(o => o.draw());
  robot.render();
  
  if (opponent && room) {
    opponent.render();
    // Make sure to only send it every 4 frames and when the robot is moving?
    if (socket && frameCount % 2) {
      socket.emit("sendRobotVel", {vx: robot.body.velocity.x, vy:robot.body.velocity.y, vr:robot.body.angularVelocity, room: room});
    }
  }
}