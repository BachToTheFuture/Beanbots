
// Keep track of our socket connection
let socket;
let colors = {}; // Each new connected user has a color

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  background(0);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('https://p5js-socket-draw.glitch.me/');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('mouse',
    // When we receive data
    function(data) {
      console.log("Got: " + data.x + " " + data.y);
      // Draw a blue circle
      stroke(data.dat.color, 50, 100);
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
  stroke(0,20,100);
  strokeWeight(3);
  line(pmouseX,pmouseY,mouseX,mouseY);
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