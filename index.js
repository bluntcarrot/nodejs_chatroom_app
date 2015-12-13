var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var num_users = 0,
	users_obj = {},
	users_color = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	
	// when the client emits 'add user', this listens and executes
	socket.on('add user', function (user_info) {
		
		// store global variables
		++num_users;
		users_obj[user_info.username] = user_info.username;
		users_color[user_info.username] = user_info.color;
		
		// store the username in the socket session for this client
		socket.username = user_info.username;
		
		socket.emit('login', {
			users: users_obj,
			num_users: num_users
		});
		
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
			username: socket.username,
			num_users: num_users
		});
		
	});
	
	socket.on('chat message', function(data){
		data = { 'data': data, 'users_color': users_color };
		io.emit('chat message', data);
	});
	
	// when the user disconnects...
	socket.on('disconnect', function () {

		--num_users;
		delete users_obj[socket.username];

		// echo globally that this client has left
		socket.broadcast.emit('user left', {
			username: socket.username,
			num_users: num_users
		});
		
	});
	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});