const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
// const createAdapter = require("@socket.io/redis-adapter").createAdapter;
// const redis = require("redis");
// const { createClient } = redis;
require("dotenv").config();

const { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID, UserExists } = require("./Client_Side/js/users");
const expressApp = express();
const nodeServer = http.createServer(expressApp);
const mySocket = socketIo(nodeServer);
expressApp.use(express.static(path.join(__dirname, 'Client_Side')));

// (async () => {
//     pubClient = createClient({ url: "redis://127.0.0.1:6379" });
//     await pubClient.connect();
//     subClient = pubClient.duplicate();
//     io.adapter(createAdapter(pubClient, subClient));
// })();

// When A Client Connects
mySocket.on('connection', socket => {
    socket.on('EnterRace', ({ username, gameId }) => {
        const usersInGame = getUsersGameID(gameId);
        console.log('Connection: ', username, gameId);
        if (usersInGame.length < 2 && !getCurrentUser(username)) {
            // Join User to server
            const addUser = JoinLoop(socket.id, username, gameId);
            socket.join(addUser);
            UsersAndRooms(getUsersGameID(gameId), gameId);

            // Broadcast when a user connects
            socket.broadcast.to(addUser.gameId).emit("message", `${addUser.username} has joined the chat`);
            mySocket.emit('message', 'A user has connected to the server');
            // Send users and gameId info
            mySocket.to(addUser.gameId).emit("InTheGame", { gameId: addUser.gameId, users: usersInGame });
        } else {
            socket.emit('userAlreadyExists', username);
            socket.disconnect();
        }
    });

    // When a Client disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnect: ',socket.id);
        const leaveRoom = LeaveGame(socket.id);
        if (leaveRoom) {
            console.log('Disconnect: ', leaveRoom.gameId,leaveRoom.username);
            UsersAndRooms(getUsersGameID(leaveRoom.gameId), leaveRoom.gameId);
            mySocket.to(leaveRoom.gameId).emit('message', `${leaveRoom.username} has Left the Game`);
            mySocket.to(leaveRoom.gameId).emit("GamingUsers", { gameId: leaveRoom.gameId, users: getUsersGameID(leaveRoom.gameId) });
        }
        mySocket.emit('message', 'A user has disconnected from the server');
    });
});

var PORT = process.env.PORT || 3000;
nodeServer.listen(PORT, () => { console.log(`Our Multi-User Server is Running on Port: ${PORT}}`); });