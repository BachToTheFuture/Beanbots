
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

class Challenge {
  constructor(name) {
    this.name = name;
    this.pointBoundaries = [
      {boundary:[100, 305, 200, 10], points: 10, to: "blue", type: "line"},
      {boundary:[500, 305, 200, 10], points: 10, to: "red", type: "line"},
    ];
    this.bluePoints = 0;
    this.redPoints = 0;
  }
  resetPoints() {
    this.bluePoints = 0;
    this.redPoints = 0;
  }
  setupField() {
    // Create boundaries and walls
    topWall = Bodies.rectangle(width/2, -5, width, 10, { isStatic: true});
    rightWall = Bodies.rectangle(width+5, height/2, 10, height, { isStatic: true});
    leftWall = Bodies.rectangle(-5, height/2, 5, height, { isStatic: true});
    bottomWall = Bodies.rectangle(width/2, height+5, width, 10, { isStatic: true});
    World.add(world, [topWall, leftWall, rightWall, bottomWall]);
    
    // Add point boundaries where players can score points
    this.pointBoundaries.forEach(p => {
      let bounds = Bodies.rectangle(p.boundary[0], p.boundary[1],p.boundary[2],p.boundary[3]);
      bounds.isSensor = true;
      bounds.isStatic = true;
      bounds.role = p.type;
      bounds.points = p.points;
      bounds.to = p.to;
      World.add(world, bounds);
    })

    // Add foundation?
    //objects.push(new Box(width/2-50, 70, 55, 100, color(219, 91, 87), "bluefoundation"));
    //objects.push(new Box(width/2+50, 70, 55, 100, color(0, 91, 87),"redfoundation"));

    for (var i = 0; i < 8; i++) {
      objects.push(new Box(width/2-114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
    }
    for (var i = 0; i < 8; i++) {
      objects.push(new Box(width/2+114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
    }
    
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
    
    /*
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
    */
  }
  endGame() {
    /*
    Function used for cleaning up and resetting values after a game ends.
    */
    robot.textColor = "black";
    if (opponent) World.remove(world, opponent.body);
    socket = null;
    opponent = null;
    room = null;
    team = null;
    
    this.resetPoints();

    $(".runRobot").fadeIn();
    $("#join-match").text("Play a match!");
    $("#join-match").fadeIn();
    $(".competition-bar").hide();
    $(".practice-bar").fadeIn();
    robot.reset();
    objects.forEach(o => o.reset());
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
    robot = new Robot(generateName(), 40, height/2+100, `hsl(${Math.floor(random(0,360))}, 100%, 71%)`);
    robot.wheels = new NormalWheels(robot);
    var workspaceBlocks = document.getElementById("workspaceBlocks"); 
    Blockly.Xml.domToWorkspace(workspaceBlocks, workspace);

    robot.code = Blockly.JavaScript.workspaceToCode(workspace).slice(9); // slice out beginning comments
    robot.code = `/*
Useful functions
=====================
robot.move(velocity)
  - move robot forward or backward
  - ex: robot.move(2)

await robot.wait(miliseconds)
  - wait for several miliseconds before
    stopping the robot
  - ex: robot.move(2);
        await robot.wait(1000); // 1 second

await robot.until(()=>(condition))
  - wait until condition is fulfilled then
    stop the robot
  - ex: 
        robot.move(2);
        await robot.until(()=>(
          robot.parts.distanceSensor.distance < 50
        ))

async ` + robot.code;
    editor.setValue(robot.code);
    
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