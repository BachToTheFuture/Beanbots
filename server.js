// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let queue = [];

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
    //console.log(clients[socket.id]);
    if (queue.length < 1) {
      queue.push(socket.id);
      // The user ID is the room's name
      socket.join(socket.id);
    }
    else {
      // join room with this person.
      let roomname = queue.shift();
      socket.join(roomname);
      let side = Math.random() > 0.5 ? "red" : "blue";
      io.to(roomname).emit('matchAccepted', {ready: true, side: side});
      io.to(socket.id).emit('matchAccepted', {ready: true, side: side == "red" ? "blue" : "red"});
      var room = io.sockets.adapter.rooms[roomname];
      console.log(room.length)
    }
    // When this user emits, client side: socket.emit('otherevent',some data);
    // Players send their robot objects to the server and the server runs the game
    socket.on('initializeGame', function(data) {
      console.log(data);
      //delete clients[socket.id];
    });
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
      //delete clients[socket.id];
    });
  }
);
