var express = require('express');
var app = express();
var path = require('path');
// static content
app.use(express.static(path.join(__dirname, './static')));
// setting up views folder and ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// serve the index page for the root route
app.get('/', function(req, res) {
  res.render('index');
})
var server = app.listen(8000);
var io = require('socket.io').listen(server);
// Insert DB config here instead of hardcoding messages and users
var messages = [];
var users = {};
// socket functionality
io.sockets.on('connection', function(socket) {
  // set up socket listeners for a particular socket when a connection is made
  socket.on('newUser', function(data) {
    users[socket.id] = data.name;
    socket.emit('initialMessages', {messages: messages});
    var message = data.name + ' has joined the chat!';
    messages.push(message);
    socket.broadcast.emit('newMessage', {message: message});
  });
  socket.on('messageSubmit', function(data) {
    messages.push(data.message);
    io.emit('newMessage', {message: data.message});
  });
  socket.on('disconnect', function() {
    var message = users[socket.id] + ' has disconnected!';
    socket.broadcast.emit('newMessage', {message: message});
  });
})
