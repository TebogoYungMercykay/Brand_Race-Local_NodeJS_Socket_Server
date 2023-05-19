const express = require("express");
const path = require("path");
const http = require("http");
const axios = require('axios');
const jquery = require('jquery');
const socketIo = require("socket.io");
// const createAdapter = require("@socket.io/redis-adapter").createAdapter;
// const redis = require("redis");
// const { createClient } = redis;
require('dotenv').config({ path: 'set_env.env' });

const { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID, UserExists } = require("./Client_Side/js/users");
const expressApp = express();
expressApp.use(express.urlencoded({ extended: true }));
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
    // Define a route to handle the request
    expressApp.get('/send-request', (req, res) => {
        console.log("Express Server Started...");
        // Define the request payload or parameters
        const payload = {
            limit: 5
        };
        // Make the request using axios
        axios.post(process.env.WURL, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: process.env.WUSERNAME,
                password: process.env.WPASSWORD
            }
        })
        .then(response => {
            // Handle the response data
            console.log(response.data);
            res.send(response.data);
        })
        .catch(error => {
            // Handle the error
            console.log(error);
            res.status(500).send('Error occurred while sending the request.');
        });
    });
    // DONE
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
// const axios = require('axios');
expressApp.get('/send-request', (req, res) => {
    const options = {
        url: process.env.WURL,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: process.env.WUSERNAME,
            password: process.env.WPASSWORD
        },
        data: {limit:"5"}
    };

    axios(options).then(response => {
        const body = response.data;
        if (body.status !== 'success') {
            console.log('Request Failed: ' + body.data.data);
            res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
            res.write(JSON.stringify(body));
            res.end();
            return;
        } else {
            console.log(body);
            res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
            res.write(JSON.stringify(r));
            res.end();
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).send('Error occurred while sending request');
    });
});

var PORT = process.env.PORT || 3000;
nodeServer.listen(PORT, () => { console.log(`Our Multi-User Server is Running on Port: ${PORT}}`); });
