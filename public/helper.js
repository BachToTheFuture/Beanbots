var robot;
var socket;

// This function is a lifesaver, trust me
function drawRect(x,y,width,height,rotation,originX,originY) {
  push(); // Save origin
  // If originX or originY is defined
  if (originX && originY) {
    // Rotate around (originX, originY)
    translate(originX, originY);
    rotate(rotation);
    rect(x-originX,y-originY, width, height);
    pop(); // Restore origin
  }
  else {
    // Assume we're rotating the object around its own center
    translate(x+width/2, y+height/2);
    rectMode(CENTER);
    rotate(rotation);
    rect(0,0, width, height);
    pop(); // Restore origin
  }
}

function notification(msg) {
  $('#main-toast-body').html(msg);
  $('.toast').toast('show');
}

$(function() {
  
  $("#join-match").click(e => {
    socket = io.connect('https://code-bean-kamen.glitch.me');
    
    socket.on('matchAccepted', function(data) {
      // Tell the user that they've been matched
      notification(`You have been matched with an opponent!<br>You are on the <b>${data.side}</b> team.`)
      if (data.side == "red") {
        robot.x = width/2-100;
        robot.y = height/2;
      }
      else {
        robot.x = width/2+100;
        robot.y = height/2;
      }
      
      //socket.emit("initializeGame", {robot: true});
    });
  })
  
  $('.equip').click(event => {
    let target = $(event.target).parent();
    console.log(target)
    // We need this so we know if the item is equipped or not
    
    if (target.hasClass("equip")) {
      target.removeClass("equip");
      target.addClass("equipped");
      let item = target.attr("id");
      let name = $("#"+item+"Name").val();
      let color = $("#"+item+"Color").val();
      let placement = $("#"+item+"Placement").val();
      console.log(name);
      console.log(color);
      console.log(placement);

      switch(item) {
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
    }
    else {
      target.removeClass("equipped");
      target.addClass("equip");
      let item = target.attr("id");
      // If this is a wheel
      if (item.includes("Wheel")) {
        notification("You can't take off the robot's wheels!")
      }
      else {
        let name = $("#"+item+"Name").val();
        delete robot.parts[name];
      }
    }
  });
  
  $('.updateRobot').click(event => {
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
  <a id="${s}" href="#" class="input-group-prepend equip">
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
`);});
    userWheels.forEach(s => {
    $("#user-wheels").append(`
<div class="input-group">
  <a id="${s}" href="#" class="input-group-prepend equip">
    <span class="input-group-text" id="${s}">${s}</span>
  </a>
  <input type="text" class="form-control" id="${s}Color"placeholder="Wheel color">
</div>
`);});
}