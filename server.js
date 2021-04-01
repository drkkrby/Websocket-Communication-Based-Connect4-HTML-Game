var express = require('express');
var WebSocket = require('ws');

var app = express();

// this exposes the contents of the folder 'static' to the server by default the browser looks for a file called index.html
// so you don't have to explictly state that accessing '/' should return index.html
app.use(express.static('static'));

// If you get some sort of EADDRINUSE error try switching these around.
// Use ports above 1000 and if you want to be safe use 5-digit ports.
// The socket port has to match with the port defined on line 1 in client.js
// Beware that sometimes nodemon processes or node in general
// don't exit properly so you can have an old process of your app
// already listening to that port
const socketPort = 3001;
const serverPort = 3000;

const wss = new WebSocket.Server({
	port: socketPort
});

// we want to log all errors
wss.on('error', (error) => {
	console.log('Error has occured on socket:' + error);
});

// we use this to make our life easier, read on
function serializeSocketMessage(type, payload) {
	return JSON.stringify({ type: type, payload: payload });
}

// right here, we can define GLOBAL variables for our server such as
//
// playerOneName, playerTwoName,
// players = [], gamesStarted = 0
// maybe keep a boardState = [][]?
//
// etc.
var gamesStarted = 0;
var connectedPlayerCount = 0;

wss.broadcast = function (data, sender) {
	wss.clients.forEach(function (client) {
		if (client !== sender) {
			client.send(data)
		}
	})
}


// this function is called everytime a new client connects
wss.on('connection', (socket, request) => {
	// this is a good place to define user-specific variables such as
	// name, player color?

	connectedPlayerCount++;

	if (connectedPlayerCount == 2) {
		var die = Math.random()
		var color = die < 0.5 ? true : false;
		socket.send(serializeSocketMessage('startGame', { color: color }))
		wss.broadcast(serializeSocketMessage('startGame', { color: !color }),socket)
		gamesStarted++;
	}
	console.log('Client connected; Total player count: ' + connectedPlayerCount);

	// this function is called every time that particular client sends a message
	socket.onmessage = (message) => {
		// Since the websocket protocol only supports string messages,
		// this boilerplate is here to make our life easier.
		// The client sends serialized JSON objects with propeties type and payload.

		// This line parses it
		var messageObject = JSON.parse(message.data);

		// This is equivalent to saying
		// let type = messageObject.type;
		// let payload = messageObject.payload;
		let { type, payload } = messageObject;

		// uncomment this line for easier debugging
		// console.log("Server got a message: \n" + "--->type: " + type +"\n--->payload: " + payload )

		// This is the fun part
		// Here we define our client-to-server communication
		// Switch for each type (define these yourself).
		// maybe playerHasMoved? playerHasChosenUsername?, playerHasStartedGame?
		switch (type) {
			case 'handshake':
				console.log('Client says: ' + payload.message);

				// Again, in accordance to our specially defined server-client
				// communication® protocol™ (the mutual agreement between our
				// server.js and client.js to send serialized json objects
				// with properties type and payload) we call the function
				// serializeSocketMessage(type, payload) which returns exactly that.
				// remember types don't exist here so payload could be anything including
				// objects, arrays, strings, numbers, whatever
				socket.send(serializeSocketMessage('handshakeReply', "Who's Joe?"));
				break;
			case 'playerMove':
				console.log(payload);
				wss.broadcast(serializeSocketMessage("opponentHasMoved", payload), socket)
				break;
			case 'win':
				wss.broadcast(serializeSocketMessage('win', payload), socket)
				break;
			default:
				// if we don't match any types, log this:
				console.log('Got message with unknown type: ' + messageObject);
		}
	};

	// this function closes whenever a client disconnects
	// e.g. user refreshes/closes page,
	socket.onclose = (ev) => {
		console.log('Client disconnected!');
		connectedPlayerCount--;
	};
});

app.listen(serverPort, () => {
	console.log('Server is up and running!\n');
});
