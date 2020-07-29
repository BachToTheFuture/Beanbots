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
      queue.push({id: socket.id, team: Math.random() > 0.5 ? "red" : "blue"});
      // The user ID is the room's name
      socket.join(socket.id);
    }
    else {
      // join room with this person.
      // Make sure no one gets put in a room with themselves!
      if (queue[0].id != socket.id) {
        console.log("QUEUE", queue, socket.id);
        let r = queue.shift();
        let roomname = r.id;
        let side = r.team;
        socket.join(roomname);
        io.to(roomname).emit('matchAccepted', {ready: true, side: side, room: roomname});
        io.to(socket.id).emit('matchAccepted', {ready: true, side: side == "red" ? "blue" : "red", room: roomname});
        var room = io.sockets.adapter.rooms[roomname];
        console.log(room.length)
      }
    }
    // When this user emits, client side: socket.emit('otherevent',some data);
    // Players send their robot objects to the server and the server runs the game
    socket.on('sendInitData', function(data) {
      // Send robot data over to the other player
      socket.to(data.room).emit("opponentData", data);
    });
  
    socket.on('sendRobotPos', function(data) {
      // Send robot data over to the other player
      socket.to(data.room).emit("opponentPos", data);
    });
  
    socket.on('sendObjectPos', function(data) {
      // Send robot data over to the other player
      socket.to(data.room).emit("updateObjectPos", data);
    });
  
    socket.on('disconnect', function() {
      console.log(socket.id+" has disconnected");
      //if (queue.includes(socket.id)) queue.splice(queue.findIndex(socket.id), 1);
    });
  }
);
