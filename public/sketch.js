
// Keep track of our socket connection
let socket;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('https://p5js-socket-draw.glitch.me/');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('mouse',
    // When we receive data
    function(data) {
      console.log("Got: " + data.x + " " + data.y + " from " + data.id);
      // Draw a blue circle
      fill(0,0,255);
      strokeWeight(3);
      line(data.px,data.py,data.x, data.y);
    }
  );
}

function draw() {
  // Nothing
}

function mouseDragged() {
  // Draw some white circles
  fill(255);
  noStroke();
  line(pmouseX,data.p,data.x, data.y);
  // Send the mouse coordinates
  sendmouse(mouseX,mouseY,pmouseX, pmouseY);
}

// Function for sending to the socket
function sendmouse(xpos, ypos, px, py) {
  // We are sending!
  console.log("sendmouse: " + xpos + " " + ypos);
  
  // Make a little object with  and y
  var data = {
    x: xpos,
    y: ypos,
    px: px,
    py: py,
  };

  // Send that object to the socket
  socket.emit('mouse',data);
}