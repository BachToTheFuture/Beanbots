// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let clients = {};

app.use(express.static(__dirname + '/public' ));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
    clients[socket.id] = {color: Math.floor(Math.random()*360)}
    //console.log(clients[socket.id]);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        data.dat = clients[socket.id];
        console.log(data);
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
      delete clients[socket.id];
    });
  }
);

let video = document.getElementById('videoInput');
let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let cap = new cv.VideoCapture(video);

const FPS = 30;
function processVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            src.delete();
            dst.delete();
            return;
        }
        let begin = Date.now();
        // start processing.
        cap.read(src);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow('canvasOutput', dst);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        utils.printError(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);