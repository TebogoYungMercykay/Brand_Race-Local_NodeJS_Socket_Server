const express = require("express");
const path = require("path");
const http = require("http");
const axios = require('axios');
const jquery = require('jquery');
const socketIo = require("socket.io");
const readline = require('readline');

require('dotenv').config({ path: 'set_env.env' });
const socketCollection = new Map();
var user1Score = null;
var user2Score = null;
var CheckID = null;

const { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID, allGamePlayers, GamesAlone, RemoveUser, getGameID } = require("./Client_Side/js/users");
const expressApp = express();
expressApp.use(express.urlencoded({ extended: true }));
const nodeServer = http.createServer(expressApp);
const io = socketIo(nodeServer);
expressApp.use(express.static(path.join(__dirname, 'Client_Side')));

// When A Client Connects
io.on('connection', socket => {
    // Define a route to handle the request
    socket.on('EndGameFast', ({ username, gameId }) => {
        console.log(`### ${username} Left The Game!!, THE GAME STOPPED.`);
        console.log('___________________________________________________');
        io.to(gameId).emit('StopGameFast', { username, gameId });
    });
    // Receive the client's score
    socket.on('Score', ({score, username, gameId}) => {
        console.log('Score received');
        if (user1Score === null) {
            // Assign the score to user1
            CheckID = username;
            user1Score = parseInt(score);
        } else if (user2Score === null && gameId == getGameID(CheckID))  {
            // Assign the score to user2
            user2Score = parseInt(score);
            // Compare the scores and determine the winner
            const winnerId = user1Score > user2Score ? 1 : 2;
            // Emit the winner's name to all clients
            if (winnerId == 1) {
                io.emit('Winner', {CheckID, user1Score});
            } else {
                io.emit('Winner', {username, user2Score});
            }
        }
    });

    socket.on('EnterRace', ({ username, gameId }) => {
        var usersInGame = getUsersGameID(gameId);
        socketCollection.set(username, socket);
        console.log('\nConnection: ', username, gameId);
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
            io.to(addUser.gameId).emit("InTheGame", { gameId: addUser.gameId, users: usersInGame });
            // Starting the game LOOP:
            if (usersInGame.length == 2) {
                console.log(`Sending StartGame event to ${addUser.gameId} room`);
                io.to(addUser.gameId).emit("StartGame", { gameId: addUser.gameId, users: usersInGame });
            }
        } else {
            socket.emit('userAlreadyExists', username);
            console.log('\nUser already exists with Username: ' + username + ' on server!');
            socket.disconnect();
        }
    });

    // When a Client disconnects
    socket.on('disconnect', () => {
        console.log('\nClient disconnect: ', socket.id);
        const leaveRoom = LeaveGame(socket.id);
        if (leaveRoom) {
            console.log('Disconnect: ', leaveRoom.gameId, leaveRoom.username);
            UsersAndRooms("Disconnect", getUsersGameID(leaveRoom.gameId), leaveRoom.gameId);
            io.to(leaveRoom.gameId).emit('message', `${leaveRoom.username} has Left the Game`);
            io.to(leaveRoom.gameId).emit("GamingUsers", { gameId: leaveRoom.gameId, users: getUsersGameID(leaveRoom.gameId) });
        }
        io.emit('message', 'A user has disconnected from the server');
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
            // Variable to track server status
            let serverRunning = false;
            function startServer() {
                if (serverRunning) {
                    console.log('.. ERROR: Server is Already Running! ..............');
                    console.log('___________________________________________________');
                    displayPrompt();
                    return;
                }
                nodeServer.listen(PORT, () => {
                    serverRunning = true;
                    console.log(`Our Multi-User Server is Running on Port: ${PORT} ....`);
                    console.log('___________________________________________________');
                    displayPrompt();
                });
            }
            function stopServer() {
                if (!serverRunning) {
                    console.log('... ERROR: Server is Not Running! .................');
                    console.log('___________________________________________________');
                    displayPrompt();
                    return;
                }
                nodeServer.close(() => {
                    serverRunning = false;
                    console.log('.... Quit Successful: Server has been Stopped .....');
                    console.log('............ GAME FORCEFULLY STOPPED ..............');
                    console.log('___________________________________________________');
                });
            }
            startServer();
            function displayPrompt() {
                const readLineObject1 = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    terminal: false
                });
                console.log('___________________________________________________');
                readLineObject1.on('line', (input) => {
                    const command = input.trim().toUpperCase();
                    if (command === 'LIST') {
                        commandList();
                    } else if (command === 'QUIT') {
                        commandQuit();
                    } else if (command.startsWith('KILL')) {
                        commandKill(input);
                    } else if (command === 'GAMES') {
                        commandGames();
                    } else if (command === 'START') {
                        commandGames();
                    } else {
                        console.log('Unrecognized Command!!');
                        displayPrompt();
                    }
                });
                readLineObject1.on('close', () => {
                    console.log('....... EXITING COMMAND LINE INTERFACE ............');
                    console.log('___________________________________________________');
                    process.exit(0);
                });
            }
            // Function definitions for commands
            function commandList() {
                allGamePlayers();
                console.log('___________________________________________________');
                displayPrompt();
            }
            function commandQuit() {
                stopServer();
            }
            function commandKill(command) {
                console.log(`Command: ${command}`);
                const [firstName, lastName] = command.split(" ");
                var temp = RemoveUser(lastName);
                if (temp !== -1) {
                    var ob = getCurrentUser(lastName);
                    console.log(`.. KILL Connection: Successful ....................`);
                    console.log(`Username: ${lastName} ID: ${ob.id}`);
                    const socket2 = socketCollection.get(lastName);
                    if (socket2) {
                        socket2.disconnect();
                        socketCollection.delete(lastName);
                    }
                } else {
                    console.log(`ERROR: User ${lastName} doesn't exist`);
                }
                console.log('___________________________________________________');
                displayPrompt();
            }
            function commandGames() {
                GamesAlone();
                console.log('___________________________________________________');
                displayPrompt();
            }
        }
    });
}
EnterDifferentPort();
