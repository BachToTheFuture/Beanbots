/*
helper.js
====================================
All the helper functions go here.
*/

/* Initializations */
var robot;
var opponent;
var socket;
var room;
var collectibles = [];
var team;

function createRobotFromJSON(op){
  // Create a new robot out of this data
  let r = new Robot(op.name, 40, height/2+100, op.color);
  // Get the code
  r.code = op.code;
  // reconstruct wheels
  if (op.wheels.type == "NormalWheels")
    r.wheels = new NormalWheels(r, op.wheels.color);
  else if (op.wheels.type == "MecanumWheels")
    r.wheels = new MecanumWheels(r, op.wheels.color);
  
  Object.keys(op.parts).forEach(part => {
    let val = op.parts[part];
    if (val.type == "ColorSensor")
      r.parts[part] = new ColorSensor(r, val.side, val.color);
    else if (val.type == "DistanceSensor")
      r.parts[part] = new DistanceSensor(r, val.side, val.color);
    
  });
  return r;
}     

function drawRect(x, y, width, height, rotation, originX, originY) {
  /*
  Function used to draw the robot's parts.
  It's useful because it draws the robot parts correctly when the robot rotates.
  */
  push();
  if (originX && originY) {
    // Rotate the object around the robot's origin
    translate(originX, originY);
    rotate(rotation);
    rect(x - originX, y - originY, width, height);
    pop();
  } else {
    // Assume we're rotating the object around its own center
    translate(x + width / 2, y + height / 2);
    rectMode(CENTER);
    rotate(rotation);
    rect(0, 0, width, height);
    pop();
  }
}

function notification(msg) {
  /*
  Shows popover notifications
  */
  $("#main-toast-body").html(msg);
  $(".toast").toast("show");
}

/*
This big function contains all of the event handlers,
including button press and socket events.
*/
$(document).ready(function() {
  $(".runRobot").click(e => {
    /* Handle "Run robot" button */
    let target = $(e.target);
    if (target.hasClass("btn-success")) {
      target.removeClass("btn-success");
      target.addClass("btn-danger");
      target.html("Reset robot");
      robot.code = Blockly.JavaScript.workspaceToCode(workspace).slice(9); // slice out beginning comments
      robot.code = "(async " + robot.code + ")()";
      console.log(robot.code);
      robot.run();
      
      /* Save the robot's name, color, and code to the storage */
      window.localStorage.clear();
      window.localStorage.setItem('robo_data', JSON.stringify(JSON.decycle(robot)));
      var xml = Blockly.Xml.workspaceToDom(workspace);
      var xml_text = Blockly.Xml.domToText(xml);
      window.localStorage.setItem('robo_code', xml_text);
      
    } else {
      target.removeClass("btn-danger");
      target.addClass("btn-success");
      target.html("Run robot");
      robot.reset();
      objects.forEach(o => o.reset());
    }
  });

  $("#join-match").click(e => {
    /* Handle "Join match" button */
    if (robot.code === "") {
      // Checks if the user actually has code
      notification(`Please give your robot some code 🥺`);
    } else {
      // Hide the "run robot" button
      $(".runRobot").hide();
      // Create new socket connection
      socket = io({ transports: ["websocket"], upgrade: false }).connect(
        "https://beanbots.glitch.me"
      );
      notification(`Waiting for an opponent... please wait!`);
      $(e.target).prop("disabled", true);
      $(e.target).html("Waiting for an opponent...");
      
      // Reset scores
      challenge.resetPoints();
      
      // If the match request is accepted
      socket.on("matchAccepted", function(data) {
        
        // Update field
        console.log(data.objects);
        if (data.objects) {
          data.objects.forEach((o,i)=>{
            objects[i].width = o.w;
            objects[i].height = o.h;
            objects[i].body.role = o.type;
            objects[i].body.color = o.color;
            Body.setPosition(objects[i].body, {x: o.x, y: o.y})
            objects[i].color = o.color;
          })
        }
        
        $("#join-match").prop("disabled", false);
        // Hide the join match button
        $("#join-match").hide();
        // Tell the user that they've been matched
        notification(
          `You have been matched with an opponent!<br>You are on the <b>${data.side}</b> team.`
        );
        $(".practice-bar").hide(); // Hide the entire rightside of the screen
        $(".competition-bar").fadeIn(); // Show the scores and timer
        
        // Set a new room!
        room = data.room;
        if (data.side == "red") {
          document.querySelector(".red-team").textContent = robot.name;
        } else {
          document.querySelector(".blue-team").textContent = robot.name;
        }
        
        socket.emit("sendInitData", {
          robot: JSON.decycle(robot),
          room: room
        });
        
        // Move the robots to their respective starting positions based on teams.
        
        // Change the robot's name color to indicate which one is you!
        robot.textColor = data.side == "red" ? "#ff5145" : "#347aeb";
        // Store the robot side;
        team = data.side;

        // Create a 5 second timer to count down
        timer = new CountDownTimer(5);
        let display = document.querySelector("#countdown-timer");
        timer.onTick(format).start();

        // Count down!
        $("#countdown-timer").fadeIn();
        function format(minutes, seconds) {
          display.textContent = seconds;
          // When the first countdown finishes start the 30 second timer
          if (seconds == 0) {
            $("#countdown-timer").fadeOut();
            console.log("Robot started running!");
            robot.run();
            opponent.run();
            let timer2 = new CountDownTimer(15);
            let display = document.querySelector("#timer");
            timer2.onTick(format).start();
            function format(minutes, seconds) {
              minutes = minutes < 10 ? "0" + minutes : minutes;
              seconds = seconds < 10 ? "0" + seconds : seconds;
              display.textContent = minutes + ":" + seconds;
              document.querySelector(".red-score").textContent = challenge.redPoints;
              document.querySelector(".blue-score").textContent = challenge.bluePoints;
              if (seconds == 0) {
                // End game here
                // Check for winners
                if (team == "red") {
                  if (challenge.redPoints > challenge.bluePoints) notification("You won!");
                  else notification("Good game!");
                }
                else if (team == "blue") {
                  if (challenge.bluePoints > challenge.redPoints) notification("You won!");
                  else notification("Good game!");
                }
                challenge.endGame();
              }
            }
          }
        }
      });

      socket.on("opponentData", function(data) {
        /* Get the initial opponent's data */
        if (!opponent) {
          // Create a new robot out of this data
          let op = data.robot;
          opponent = createRobotFromJSON(op);
          if (team == "blue") {
            Body.setPosition(opponent.body, {x: width-40, y: height/2+100});
            opponent.rotation = Math.PI;
            Body.setAngle(opponent.body, Math.PI);
            
            Body.setPosition(robot.body, {x: 40, y: height/2+100});
            robot.rotation = 0;
            Body.setAngle(robot.body, 0);
            document.querySelector(".red-team").textContent = opponent.name;
          }
          else {
            Body.setPosition(opponent.body, {x: 40, y: height/2+100});
            opponent.rotation = 0;
            Body.setAngle(opponent.body, 0);
            
            Body.setPosition(robot.body, {x: width-40, y: height/2+100});
            robot.rotation = Math.PI;
            Body.setAngle(robot.body, Math.PI);
            document.querySelector(".blue-team").textContent = robot.name;
          }
        };
      });

      socket.on("updateCollectiblePos", function(data) {
        /* Update a collectible's position if it moves */
        let c = objects[data.idx];
        c.x = data.x;
        c.y = data.y;
        c.color = data.color;
      });
    }
  });

  $(document).on("click", ".equipToggle", event => {
    /*
    This part is for equipping accessories to the robot!
    */
    let target = $(event.target).parent();
    console.log(target);
    if (target.hasClass("equip")) {
      target.removeClass("equip");
      target.addClass("equipped");
      let item = target.attr("id");
      let color = $("#" + item + "Color").val();
      let placement = $("#" + item + "Placement").val();
      console.log(color);
      console.log(placement);

      switch (item) {
        case "NormalWheels":
          robot.wheels = new NormalWheels(robot, color);
          break;
        case "MecanumWheels":
          robot.wheels = new MecanumWheels(robot, color);
          break;
        case "ColorSensor":
          robot.parts.colorSensor = new ColorSensor(robot, placement, color);
          break;
        case "DistanceSensor":
          robot.parts.distanceSensor = new DistanceSensor(robot, placement, color);
          break;
      }
    } else {
      let item = target.attr("id");
      target.removeClass("equipped");
      target.addClass("equip");
      let name = $("#" + item + "Name").val();
      delete robot.parts[name];
    }
  });

  $(".updateRobot").click(event => {
    let target = $(event.target).parent();
    let name = $("#robotName").val();
    let color = $("#robotColor").val();
    robot.name = name;
    robot.color = color;
  });
});

function giveUserRandomItems() {
  // Give user random items from each category
  //userSensors.push(random(allSensors));
  //userWheels.push(random(allWheels));
  
  userSensors = allSensors;
  userWheels = allWheels;
  // have this group for each item
  userSensors.forEach(s => {
    $("#user-sensors").append(`
<div class="input-group">
  <a id="${s}" class="equipToggle input-group-prepend equip">
    <span class="input-group-text" id="${s}">${s}</span>
  </a>
  <input type="text" class="form-control" id="${s}Color" placeholder="Sensor color">
  <select class="custom-select" id="${s}Placement">
    <option selected>Placement</option>
    <option value="left">left</option>
    <option value="right">right</option>
    <option value="front">front</option>
    <option value="back">back</option>
  </select>
</div>
`);
  });
  // The user only gets one type of wheel anyway so just have it equipped.
  userWheels.forEach(s => {
    $("#user-wheels").append(`
<div class="input-group">
  <a id="${s}" class="equipToggle input-group-prepend equip">
    <span class="input-group-text" id="${s}">${s}</span>
  </a>
  <input type="text" class="form-control" id="${s}Color"placeholder="Wheel color">
</div>
`);
  });
}
