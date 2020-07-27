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
    if (queue.length == 0) queue.push(socket.id);
    else {
      // join room with this person.
      socket.join(queue.pop().id);
      alert("Matched!");
    }
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        console.log(data);
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
      //delete clients[socket.id];
    });
  }
);
