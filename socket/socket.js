// Create a new socket and connect
var socket = new WebSocket("ws://localhost:8080/");

socket.addEventListener("open", (event) => {
	console.log(event);
});
socket.onopen = function(event) {
	console.log(event);
}
// Receive data
socket.onmessage = function(event)
{
	var json = JSON.parse(event.data);
	console.log(json.message);
	document.getElementById("chat").innerHTML += json.message + "<br>";
}

// Send data
function sendCommand(command)
{
	var json = {
		"command" : command
	};
	socket.send(JSON.stringify(json)+"\r\n");
}

// Quit by sending a command
function quit()
{
	sendCommand("quit");
}

function send() {
	var msg = document.getElementById("message").value;
	socket.send(JSON.stringify({"command": "message", "message": msg})+"\r\n");
}
 