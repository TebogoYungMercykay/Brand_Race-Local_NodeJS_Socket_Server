// Sockets and Stuff
var numWins = 0;
// const { Socket } = require("socket.io");

// Extracting Username and Room from URL
const { username, gameId } = Qs.parse(location.search, { ignoreQueryPrefix: true });
const mySocket = io();

// Enter Race
mySocket.emit('EnterRace', { username, gameId });

// Print Message from server
mySocket.on('message', message => {
    console.log('Message:', message);
});

// Print Message from server
mySocket.on('StopGameFast', ({ username, gameId }) => {
    console.log(`Game: ${gameId} Ended After ${username} Left:`);
    StartGameLoop(username, gameId, undefined, true);
});

// Prompt the user before leaving the game
$('#Quit').on('click', function (event) {
    event.preventDefault();
    const leaveRoom = confirm('Are you sure you want to quit the game?');
    if (leaveRoom) {
        mySocket.emit('EndGameFast', { username, gameId });
        window.location = '../index.html';
    }
    StartGameLoop(undefined, undefined, undefined, true);
});

// Handle user already exists
mySocket.on('userAlreadyExists', username => {
    console.log('User already exists with Username:', username);
    window.location = '../index.html';
});

// Handle users and gameId
mySocket.on('GamingUsers', ({ gameId, users }) => {
    handleUsersAndGameId('GamingUsers', gameId, users);
});

// Listen for the "InTheGame" event
mySocket.on('InTheGame', ({ gameId, users }) => {
    console.log('Received InTheGame event');
    handleUsersAndGameId('InTheGame', gameId, users);
});

// Listen for the "StartGame" event
mySocket.on('StartGame', ({ gameId, users }) => {
    console.log('Game Loop About to Start MFs');
    StartGameLoop(users, gameId, 5, false);
});

mySocket.on('Winner', ({winner, userScore}) => {
    // Add_Name_Winner
    console.log('Winner Client');
    document.getElementById('Add_Name_Winner').textContent = `${winner}<br>With score ${userScore}`;
});

// Add users to DOM
function handleUsersAndGameId(eventType, gameId, users) {
    console.log('This made the Call:', eventType);
    console.log('Client Game ID:', gameId);
    const usernames = users.map(user => user.username).join(', ');
    console.log('Client Connected Users:', usernames);
}
// * GAME LOOP STARTS HERE.
// TODO: Must Refine This Function, Which Is Basically an Implementation of The Game Loop.
// TODO: The Intervals are Perfect, I just need to make sure they are Using Images from the API on the Wheatley server and not my Local API
function StartGameLoop(users, gameId, limit, clearTimeouts) {
    console.log("Game Loop Started");
    document.getElementById('Add_Contestants').textContent = "CONTESTANTS ARRIVED!!";
    if (users != undefined && gameId != undefined) {
        clearTimeouts(users, gameId);
    } else if (clearTimeouts == true) {
        clearTimeouts();
        return;
    }
    if (users == undefined || users.length == 0) {
        return;
    }
    var index = -1;
    var defaultCounter = 15;
    var defaultCounter1 = 0;
    var Answer = undefined;
    var counter = defaultCounter;
    var intervalId = undefined;
    var winner = 'No Winner for this Round';
    var breakOut = false;
    var arrayTimeoutReferences = [];
    var TimeoutReferencesIntervals = new Map();
    function toddle(id) {
        const elements = ['LoadingScreen', 'DisplayStuff', 'Landing_div', 'InTheGame', 'gameOver'];
        for (const element of elements) {
            document.getElementById(element).style.display = element === id ? 'inline-block' : 'none';
        }
    }
    // Handle brand submission
    $('#Submit_Brand').on('click', function (event) {
        event.preventDefault();
        const input = $('#brandName').val();
        if (input == Answer) {
            console.log(`Correct Answer from ${username}, They get a point!!`);
            // TODO: Must emit a message to the server and Use DOM for Overwriting the Labels
            // * Using the server's response object
            // if (intervalId !== undefined) {
            //     clearInterval(intervalId);
            // }
            // if (TimeoutReferencesIntervals.size !== 0) {
            //     const lastTimeoutId = TimeoutReferencesIntervals.get(index);
            //     console.log(index);
            //     if (lastTimeoutId) {
            //         clearTimeout(lastTimeoutId);
            //     }
            // }
            numWins += 1;
            toddle('LoadingScreen');
            document.getElementById('Add_Round_Winner').textContent = winner;
        }
    });
    function clearTimeouts(username2, gameId2) {
        if (arrayTimeoutReferences !== undefined && arrayTimeoutReferences !== null) {
            for (var i = 0; i < arrayTimeoutReferences.length; i++) {
                if (arrayTimeoutReferences[i] != undefined) {
                    clearTimeout(arrayTimeoutReferences[i]);
                }
            }
            arrayTimeoutReferences = []; // Reset the timeout references array
            breakOut = true;
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
            document.getElementById('Add_Contestants').textContent = `${username2} Has Left The Game: ${gameId2}`;
            toddle('Landing_div');
        }
    }
    function clearTimeouts() {
        if (arrayTimeoutReferences !== undefined && arrayTimeoutReferences !== null) {
            for (var i = 0; i < arrayTimeoutReferences.length; i++) {
                if (arrayTimeoutReferences[i] != undefined) {
                    clearTimeout(arrayTimeoutReferences[i]);
                }
            }
            arrayTimeoutReferences = []; // Reset the timeout references array
            breakOut = true;
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
        }
    }
    function StartGameLoopNow(limit) {
        jsonObject = {
            "limit":limit
        }
        var json = JSON.stringify(jsonObject);
        // console.log(json);
        $.ajax({
            // url: "https://wheatley.cs.up.ac.za/u20748052/hwa_api.php",
            // url: "http://localhost/API_MYSQL_DATABSE/php/api.php/GetRandomBrands",
            url: 'https://u20748052:@Tebogo1357963729@wheatley.cs.up.ac.za/u20748052/hwa_api.php',
            method: "POST",
            data: json,
            success: function(response) {
                var images = response.data;
                var timeoutReference = '';
                timeoutReference = setTimeout(function() {
                    console.log(images);
                }, 1000);
                arrayTimeoutReferences.push(timeoutReference);
                console.log("The Game will start in 5 Seconds!");
                document.getElementById('Add_Contestants').textContent = users.map(user => user.username).join(' VS ');
                toddle('DisplayStuff');
                if(breakOut == false){
                    timeoutReference = setTimeout(function() {
                        winner = 'No Winner for this Round';
                        console.log("Displaying Image ==> ", 0);
                        index = 0;
                        counter = defaultCounter;
                        intervalId = setInterval(() => {
                            if (counter > 0) {
                                var now = defaultCounter - counter + 1;
                                const formattedCounter = now < 10 ? `0${now}` : now;
                                document.getElementById('Edit_Time_Seconds').textContent = `${formattedCounter}`;
                                counter--;  // Decrement the counter by 1
                            } else {
                                counter = defaultCounter;
                                clearInterval(intervalId);
                                intervalId = undefined;
                            }
                        }, 1000);
                        toddle('InTheGame');
                        document.getElementById('imagelogo').src = images[0].image_url;
                        Answer = images[0].image_name;
                        TimeoutReferencesIntervals.set(0, timeoutReference);
                    }, 4500);
                    arrayTimeoutReferences.push(timeoutReference);
                }
                for (var j = 1; j < response.length; j++) {
                    if(breakOut == false){
                      clearInterval(intervalId);
                        if(j == 1){
                            (function(j) {
                                var time = 25000;
                                timeoutReference = setTimeout(function() {
                                    console.log("Displaying Loading Screen....", 0);
                                    toddle('LoadingScreen');
                                    document.getElementById('Add_Round_Winner').textContent = winner;
                                }, time-5000);
                                arrayTimeoutReferences.push(timeoutReference);
                                timeoutReference = setTimeout(function() {
                                    winner = 'No Winner for this Round';
                                    console.log("Displaying Image ==> ", j);
                                    index = j;
                                    counter = defaultCounter;
                                    intervalId = setInterval(() => {
                                        if (counter > 0) {
                                            var now = defaultCounter - counter + 1;
                                            const formattedCounter = now < 10 ? `0${now}` : now;
                                            document.getElementById('Edit_Time_Seconds').textContent = `${formattedCounter}`;
                                            counter--;
                                        } else {
                                            counter = defaultCounter;
                                            clearInterval(intervalId);
                                            intervalId = undefined;
                                        }
                                    }, 1000);
                                    toddle('InTheGame');
                                    document.getElementById('imagelogo').src = images[j].image_url;
                                    Answer = images[j].image_name;
                                    TimeoutReferencesIntervals.set(index, timeoutReference);
                                }, time);
                                arrayTimeoutReferences.push(timeoutReference);
                            })(j);
                        } else {
                            (function(j) {
                                var time2 = 25000 + (j-1)*20000;
                                timeoutReference = setTimeout(function() {
                                    console.log("Displaying Loading Screen....", j-1);
                                    toddle('LoadingScreen');
                                    document.getElementById('Add_Round_Winner').textContent = winner;
                                }, time2-5000);
                                arrayTimeoutReferences.push(timeoutReference);
                                timeoutReference = setTimeout(function() {
                                    winner = 'No Winner for this Round';
                                    console.log("Displaying Image ==> ", j);
                                    index = j;
                                    counter = defaultCounter;
                                    intervalId = setInterval(() => {
                                        if (counter > 0) {
                                            var now = defaultCounter - counter + 1;
                                            const formattedCounter = now < 10 ? `0${now}` : now;
                                            document.getElementById('Edit_Time_Seconds').textContent = `${formattedCounter}`;
                                            counter--;
                                        } else {
                                            counter = defaultCounter;
                                            clearInterval(intervalId);
                                            intervalId = undefined;
                                        }
                                    }, 1000);
                                    toddle('InTheGame');
                                    document.getElementById('imagelogo').src = images[j].image_url;
                                    Answer = images[j].image_name;
                                    TimeoutReferencesIntervals.set(index, timeoutReference);
                                }, time2);
                                arrayTimeoutReferences.push(timeoutReference);
                            })(j);
                        }
                    }
                }
                if(breakOut == false){
                    timeoutReference = setTimeout(function(){
                        console.log("Done Now!!!");
                        mySocket.emit('Score', {numWins, username, gameId})
                        toddle('gameOver');
                        document.getElementById('Add_Name_Winner').textContent = "To Be Announced!";
                    },105000);
                    arrayTimeoutReferences.push(timeoutReference);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
    StartGameLoopNow(limit);
}
// TODO: This CODE might be used to send a POST request to the api on the server
// Start the process by asking for a PORT number
// require('dotenv').config({ path: 'set_env.env' });
// const axios = require('axios');
// const payload = {
//   "limit": 5
// };
// axios.post('api.php', payload)
// .then(response => {
//     console.log('Response:', response.data);
// })
// .catch(error => {
//     console.error('Error:', error);
// });
