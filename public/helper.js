var robot;
var opponent;
var socket;
var room;
var collectibles = [];

// This function is a lifesaver, trust me
function drawRect(x, y, width, height, rotation, originX, originY) {
  push(); // Save origin
  // If originX or originY is defined
  if (originX && originY) {
    // Rotate around (originX, originY)
    translate(originX, originY);
    rotate(rotation);
    rect(x - originX, y - originY, width, height);
    pop(); // Restore origin
  } else {
    // Assume we're rotating the object around its own center
    translate(x + width / 2, y + height / 2);
    rectMode(CENTER);
    rotate(rotation);
    rect(0, 0, width, height);
    pop(); // Restore origin
  }
}

function endGame() {
  // Disconnect from the game and go back to the practice field!
  socket.disconnect();
  robot.textColor = "black";
  socket = null;
  opponent = null;
  room = null;
  $(".runRobot").fadeIn();
  $("#join-match").text("Play a match!");
  $("#join-match").fadeIn();
  $(".competition-bar").hide();
  $(".practice-bar").fadeIn();
  robot.reset();
}

function robotRender(data) {
  // Draw robot wheels
  switch (data.wheels.type) {
    case "NormalWheels":
      NormalWheels.renderOpponent(data);
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
  $("#main-toast-body").html(msg);
  $(".toast").toast("show");
}

$(document).ready(function() {
  $(".runRobot").click(e => {
    let target = $(e.target);
    if (target.hasClass("btn-success")) {
      target.removeClass("btn-success");
      target.addClass("btn-danger");
      target.html("Reset robot");
      robot.code = editor.getValue();
      robot.run();
    } else {
      target.removeClass("btn-danger");
      target.addClass("btn-success");
      target.html("Run robot");
      robot.reset();
    }
  });

  $("#join-match").click(e => {
    // Check if the user actually has code on the robot
    if (robot.code === "") {
      notification(`Please run your code at least once before you begin!`);
    } else {
      $(".runRobot").hide();
      socket = io({transports: ['websocket'], upgrade: false}).connect("https://code-bean-kamen.glitch.me");
      notification(`Waiting for an opponent... please wait!`);
      $(e.target).prop("disabled", true);
      $(e.target).html("Waiting for an opponent...");

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
        
        // Maybe move the "field" to the center of the screen and hide the tabs
        if (data.side == "red") {
          robot.x = width / 2 - 150;
          robot.y = height / 2;
        } else {
          robot.x = width / 2 + 100;
          robot.y = height / 2;
        }
        // Decycle removes all backreferences to the robot object
        // Set a new room!
        room = data.room;
        socket.emit("sendInitRobotData", {
          robot: JSON.decycle(robot),
          room: room
        });
        // One of the competitors change the collectibles layout and sends it to the other user
        // Change collectible positions here maybe?
        if (data.side == "red") {
          $(".red-team").text = robot.name;
          socket.emit("sendInitCollectiblesData", {
            collectibles: JSON.decycle(collectibles),
            room: room
          });
        }
        else
          $(".blue-team").text = robot.name;
        
        robot.textColor = data.side == "red" ? "#ff5145" : "#347aeb";
        
        // Create a 5 second timer to count down
        timer = new CountDownTimer(6);
        let display = document.querySelector('#countdown-timer');
        timer.onTick(format).start();
            
        $("#countdown-timer").fadeIn();
        function format(minutes, seconds) {
          display.textContent = seconds;
          if (seconds == 0) {
            $("#countdown-timer").fadeOut();
            console.log("Robot started running!")
            robot.run();

            // Start another timer
            let timer2 = new CountDownTimer(2);
            let display = document.querySelector('#timer');
            timer2.onTick(format).start();

            function format(minutes, seconds) {
              minutes = minutes < 10 ? "0" + minutes : minutes;
              seconds = seconds < 10 ? "0" + seconds : seconds;
              display.textContent = minutes + ':' + seconds;
              
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
        // Reconstruct collectibles data
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
      
      // Get opponent's positions
      socket.on("opponentPos", function(data) {
        if (opponent) {
          opponent.x = data.x;
          opponent.y = data.y;
          opponent.originX = data.originX;
          opponent.originY = data.originY;
          opponent.rotation = data.rotation;
        }
      });
      socket.on("opponentData", function(data) {
        if (!opponent) opponent = data.robot;
      });
      socket.on("updateCollectiblePos", function(data) {
        // Update a collectible's position
        let c = collectibles[data.idx];
        c.x = data.x;
        c.y = data.y;
        c.color = data.color;
      })
    }
  });

  $(document).on("click", ".equipToggle", event => {
    let target = $(event.target).parent();
    console.log(target);
    // We need this so we know if the item is equipped or not

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
        case "ColorSensor":
          robot.parts[name] = new ColorSensor(robot, placement, color);
          break;
        case "DistanceSensor":
          robot.parts[name] = new DistanceSensor(robot, placement, color);
          break;
      }
    } else {
      target.removeClass("equipped");
      target.addClass("equip");
      let item = target.attr("id");
      // If this is a wheel
      if (item.includes("Wheel")) {
        notification("You can't take off the robot's wheels!");
      } else {
        let name = $("#" + item + "Name").val();
        delete robot.parts[name];
      }
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
  userSensors.push(random(allSensors));
  userWheels.push(random(allWheels));
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
