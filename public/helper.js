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

function endGame() {
  /*
  Function used for cleaning up and resetting values after a game ends.
  */
  robot.textColor = "white";
  socket = null;
  opponent = null;
  room = null;
  team = null;
  $(".runRobot").fadeIn();
  $("#join-match").text("Play a match!");
  $("#join-match").fadeIn();
  $(".competition-bar").hide();
  $(".practice-bar").fadeIn();
  robot.reset();
  collectibles.forEach(o => o.reset());
}

function robotRender(data) {
  /*
  A function that handles the tricky bits in reconstructing the robot from a JSON file
  This function draws the opponent's robot.
  
  TODO: Draw the sensors
  */
  // Draw wheels
  switch (data.wheels.type) {
    case "NormalWheels":
      NormalWheels.renderOpponent(data);
      break;
    case "MecanumWheels":
      MecanumWheels.renderOpponent(data);
      break;
  }
  // Draw robot body
  fill(data.color);
  drawRect(data.x, data.y, data.width, data.height, data.rotation);
  // Draw the robot's name
  textAlign(CENTER);
  textStyle(BOLD);
  fill(data.textColor);
  strokeWeight(0);
  text(data.name, data.x + data.width / 2, data.y - 20);
  strokeWeight(2);
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
      robot.code = editor.getValue();
      robot.run();
      
      /* Save the robot's name, color, and code to the storage */
      window.localStorage.setItem('robo_data', JSON.stringify({name: robot.name, color: robot.color.toString(), code: robot.code}));
      
    } else {
      target.removeClass("btn-danger");
      target.addClass("btn-success");
      target.html("Run robot");
      robot.reset();
      collectibles.forEach(o => o.reset());
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
        "https://cool-bean-bots.glitch.me"
      );
      notification(`Waiting for an opponent... please wait!`);
      $(e.target).prop("disabled", true);
      $(e.target).html("Waiting for an opponent...");
      
      // If the match request is accepted
      socket.on("matchAccepted", function(data) {
        $("#join-match").prop("disabled", false);
        // Hide the join match button
        $("#join-match").hide();
        // Tell the user that they've been matched
        notification(
          `You have been matched with an opponent!<br>You are on the <b>${data.side}</b> team.`
        );
        $(".practice-bar").hide(); // Hide the entire rightside of the screen
        $(".competition-bar").fadeIn(); // Show the scores and timer

        // Move the robots to their respective starting positions based on teams.
        if (data.side == "red") {
          robot.x = width-56;
          robot.y = height/2+100;
          // flip robot 180 degrees
          robot.rotation = Math.PI;
        } else {
          robot.x = 6;
          robot.y = height/2+100;
        }
        // Set a new room!
        room = data.room;
        
        socket.emit("sendInitRobotData", {
          robot: JSON.decycle(robot),
          room: room
        });
        // One of the competitors change the collectibles layout and sends it to the other user
        if (data.side == "red") {
          document.querySelector(".red-team").textContent = robot.name;
          collectibles.forEach(c=>c.color = c.color.toString());
          socket.emit("sendInitCollectiblesData", {
            collectibles: JSON.decycle(collectibles), // Decycle removes all backreferences to the robot object
            room: room
          });
        } else {
          document.querySelector(".blue-team").textContent = robot.name;
        }
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
            let timer2 = new CountDownTimer(30);
            let display = document.querySelector("#timer");
            timer2.onTick(format).start();
            function format(minutes, seconds) {
              minutes = minutes < 10 ? "0" + minutes : minutes;
              seconds = seconds < 10 ? "0" + seconds : seconds;
              display.textContent = minutes + ":" + seconds;
              if (seconds == 0) {
                // End game here
                // Check for winners
                notification("Good game!");
                endGame();
              }
            }
          }
        }
      });
      socket.on("collectiblesData", function(data) {
        /* Update the collectibles and their positions (the cubes and balls) based on the data */
        data = data.collectibles;
        collectibles.forEach((c, cidx) => {
          Object.keys(data[0]).forEach(k => {
            if (k != "walls") {
              collectibles[cidx][k] = data[cidx][k];
            }
          });
          c.walls.forEach((wall, i) => {
            collectibles[cidx].walls[i].a.x = data[c.idx].walls[i].a.x;
            collectibles[cidx].walls[i].a.y = data[c.idx].walls[i].a.y;
            collectibles[cidx].walls[i].b.x = data[c.idx].walls[i].b.x;
            collectibles[cidx].walls[i].b.y = data[c.idx].walls[i].b.y;
            collectibles[cidx].walls[i].color = data[c.idx].walls[i].color;
          });
        });
      });

      socket.on("opponentPos", function(data) {
        /* Get opponent's positions and rotations */
        if (opponent) {
          opponent.x = data.x;
          opponent.y = data.y;
          opponent.originX = data.originX;
          opponent.originY = data.originY;
          opponent.rotation = data.rotation;
        }
      });

      socket.on("opponentData", function(data) {
        /* Get the initial opponent's data () */
        if (!opponent) opponent = data.robot;
        if (team == "red")
          document.querySelector(".blue-team").textContent = opponent.name;
        else document.querySelector(".red-team").textContent = opponent.name;
      });

      socket.on("updateCollectiblePos", function(data) {
        /* Update a collectible's position if it moves */
        let c = collectibles[data.idx];
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
      let name = $("#" + item + "Name").val();
      let color = $("#" + item + "Color").val();
      let placement = $("#" + item + "Placement").val();
      console.log(name);
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
          robot.parts[name] = new ColorSensor(robot, placement, color);
          break;
        case "DistanceSensor":
          robot.parts[name] = new DistanceSensor(robot, placement, color);
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
  <a id="${s}" href="#" class="equipToggle input-group-prepend equip">
    <span class="input-group-text" id="${s}">${s}</span>
  </a>
  <input type="text" class="form-control" id="${s}Name" placeholder="Variable name">
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
  <a id="${s}" href="#" class="equipToggle input-group-prepend equip">
    <span class="input-group-text" id="${s}">${s}</span>
  </a>
  <input type="text" class="form-control" id="${s}Color"placeholder="Wheel color">
</div>
`);
  });
}
