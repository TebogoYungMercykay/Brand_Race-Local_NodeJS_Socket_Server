// Sockets and Stuff
// Extracting Username and Room from URL
const { username, gameId } = Qs.parse(location.search, { ignoreQueryPrefix: true });
const mySocket = io();

// Enter Race
mySocket.emit('EnterRace', { username, gameId });

// Print Message from server
mySocket.on('message', message => {
    console.log('Message:', message);
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

// Add users to DOM
function handleUsersAndGameId(eventType, gameId, users) {
    console.log('This made the Call:', eventType);
    console.log('Client Game ID:', gameId);
    const usernames = users.map(user => user.username).join(', ');
    console.log('Client Connected Users:', usernames);
}
// * GAME LOOP STARTS HERE.
// Prompt the user before leaving the game
$('#Quit').on('click', function (event) {
    event.preventDefault();
    const leaveRoom = confirm('Are you sure you want to quit the game?');
    if (leaveRoom) {
        window.location = '../index.html';
    }
    StartGameLoop(undefined, undefined, undefined, true);
});
// TODO: Must Refine This Function, Which Is Basically an Implementation of The Game Loop.
// TODO: The Intervals are Perfect, I just need to make sure they are Using Images from the API on the Wheatley server and not my Local API
function StartGameLoop(users, gameId, limit, clearTimeouts) {
    console.log("Game Loop Started");
    document.getElementById('Add_Contestants').textContent = "CONTESTANTS ARRIVED!!";
    if (clearTimeouts == true) {
        clearTimeouts();
        return;
    }
    if (users == undefined || users.length == 0) {
        return;
    }
    var index = -1;
    var defaultCounter = 15;
    var counter = defaultCounter;
    var intervalId = undefined;
    var winner = users[0].username;
    var breakOut = false;
    var arrayTimeoutReferences = [];
    var TimeoutReferencesIntervals = new Map();
    function toddle(id){
        if(id == 'LoadingScreen'){
            document.getElementById('LoadingScreen').style.display = 'inline-block';
            document.getElementById('DisplayStuff').style.display = 'none';
            document.getElementById('Landing_div').style.display = 'none';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('InTheGame').style.display = 'none';
        } else if(id == 'DisplayStuff') {
            document.getElementById('LoadingScreen').style.display = 'none';
            document.getElementById('DisplayStuff').style.display = 'inline-block';
            document.getElementById('Landing_div').style.display = 'none';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('InTheGame').style.display = 'none';
        } else if(id == 'Landing_div') {
            document.getElementById('LoadingScreen').style.display = 'none';
            document.getElementById('DisplayStuff').style.display = 'none';
            document.getElementById('Landing_div').style.display = 'inline-block';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('InTheGame').style.display = 'none';
        } else if(id == 'InTheGame') {
            document.getElementById('LoadingScreen').style.display = 'none';
            document.getElementById('DisplayStuff').style.display = 'none';
            document.getElementById('Landing_div').style.display = 'none';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('InTheGame').style.display = 'inline-block';
            document.getElementById('Edit_Time_Seconds').textContent = `${defaultCounter}`;
        } else {
            document.getElementById('LoadingScreen').style.display = 'none';
            document.getElementById('DisplayStuff').style.display = 'none';
            document.getElementById('Landing_div').style.display = 'none';
            document.getElementById('gameOver').style.display = 'inline-block';
            document.getElementById('InTheGame').style.display = 'none';
        }
    }
    // Handle brand submission
    $('#Submit_Brand').on('click', function (event) {
        event.preventDefault();
        const input = $('#brandName').val();
        if (input === 'Audi') {
            console.log('Correct Answer Form This User!!');
            // TODO: Must emit a message to the server and Use DOM for Overwriting the Labels
            // * Using the server's response object
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
            if (TimeoutReferencesIntervals.size !== 0) {
                const lastTimeoutId = TimeoutReferencesIntervals.get(index);
                console.log(index);
                if (lastTimeoutId) {
                    clearTimeout(lastTimeoutId);
                }
            }
            toddle('LoadingScreen');
        }
    });
    function clearTimeouts() {
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
    function StartGameLoopNow(limit) {
        jsonObject = {
            "limit":limit
        }
        var json = JSON.stringify(jsonObject);
        // console.log(json);
        $.ajax({
            url: "http://localhost/API_MYSQL_DATABSE/php/hwa_api.php/GetRandomBrands",
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
                        console.log("Displaying Image ==> ", 0);
                        index = 0;
                        counter = defaultCounter;
                        intervalId = setInterval(() => {
                            if (counter >= 0) {
                                const formattedCounter = counter < 10 ? `0${counter}` : counter;
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
                                    console.log("Displaying Image ==> ", j);
                                    index = j;
                                    counter = defaultCounter;
                                    intervalId = setInterval(() => {
                                        if (counter >= 0) {
                                            const formattedCounter = counter < 10 ? `0${counter}` : counter;
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
                                    console.log("Displaying Image ==> ", j);
                                    index = j;
                                    counter = defaultCounter;
                                    intervalId = setInterval(() => {
                                        if (counter >= 0) {
                                            const formattedCounter = counter < 10 ? `0${counter}` : counter;
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
                        toddle('gameOver');
                        document.getElementById('Add_Name_Winner').textContent = winner;
                    },120000);
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