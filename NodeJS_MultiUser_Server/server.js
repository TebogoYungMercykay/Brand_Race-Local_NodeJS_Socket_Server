const express = require("express");
const path = require("path");
const http = require("http");
const axios = require('axios');
const jquery = require('jquery');
const socketIo = require("socket.io");
const readline = require('readline');

require('dotenv').config({ path: 'set_env.env' });
const { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID } = require("./Client_Side/js/users");
const expressApp = express();
expressApp.use(express.urlencoded({ extended: true }));
const nodeServer = http.createServer(expressApp);
const mySocket = socketIo(nodeServer);
expressApp.use(express.static(path.join(__dirname, 'Client_Side')));

// When A Client Connects
mySocket.on('connection', socket => {
    // Define a route to handle the request
    socket.on('EnterRace', ({ username, gameId }) => {
        var usersInGame = getUsersGameID(gameId);
        console.log('Connection: ', username, gameId);
        if (usersInGame.length < 2 && !getCurrentUser(username)) {
            // Join User to server
            const addUser = JoinLoop(socket.id, username, gameId);
            socket.join(addUser.gameId);
            UsersAndRooms("Connection", getUsersGameID(gameId), gameId);
            usersInGame = getUsersGameID(addUser.gameId);
            console.log("Users in the Game: " + usersInGame.length, addUser.gameId);
            // Broadcast when a user connects
            console.log(`Broadcasting message to ${addUser.gameId} room`);
            socket.broadcast.to(addUser.gameId).emit('message', `${addUser.username} has joined the game`);
            socket.emit('message', `${addUser.username} has connected to the server`);
            // Send users and gameId info
            console.log(`Sending InTheGame event to ${addUser.gameId} room`);
            mySocket.to(addUser.gameId).emit("InTheGame", { gameId: addUser.gameId, users: usersInGame });
            // Starting the game LOOP:
            if (usersInGame.length == 2) {
                console.log(`Sending StartGame event to ${addUser.gameId} room`);
                mySocket.to(addUser.gameId).emit("StartGame", { gameId: addUser.gameId, users: usersInGame });
            }
        } else {
            socket.emit('userAlreadyExists', username);
            console.log('User already exists with Username: ' + username + ' on server!');
            socket.disconnect();
        }
    });

    // When a Client disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnect: ', socket.id);
        const leaveRoom = LeaveGame(socket.id);
        if (leaveRoom) {
            console.log('Disconnect: ', leaveRoom.gameId, leaveRoom.username);
            UsersAndRooms("Disconnect", getUsersGameID(leaveRoom.gameId), leaveRoom.gameId);
            mySocket.to(leaveRoom.gameId).emit('message', `${leaveRoom.username} has Left the Game`);
            mySocket.to(leaveRoom.gameId).emit("GamingUsers", { gameId: leaveRoom.gameId, users: getUsersGameID(leaveRoom.gameId) });
        }
        mySocket.emit('message', 'A user has disconnected from the server');
    });
});
// * Making Sure a User Enters A PORT within the RANGE 1024 - 49141, NO RESERVED PORTS ALLOWED.
// 1433: Microsoft SQL Server.
// 3306: MySQL Database Server.
// 5432: PostgreSQL Database Server.
// 8080: HTTP alternative port commonly used for web servers.
const readLineObject = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function EnterDifferentPort() {
    readLineObject.question('Enter a PORT Number for the Server within RANGE [1024:49141]: ', (portNumber) => {
        let PORT = parseInt(portNumber);
        // * Checking if the User Chose a Reserved Port Number:
        if (PORT < 1024 || PORT > 49151 || PORT === 1433 || PORT === 3306 || PORT === 5432 || PORT === 8080) {
            console.log('Invalid PORT. Please choose a different PORT: ');
            //  * Enforcing a Valid PORT using Recursion!!.
            EnterDifferentPort();
        } else {
            nodeServer.listen(PORT, () => { console.log(`Our Multi-User Server is Running on Port: ${PORT}}`); });
            readLineObject.close();
        }
    });
}
EnterDifferentPort();
