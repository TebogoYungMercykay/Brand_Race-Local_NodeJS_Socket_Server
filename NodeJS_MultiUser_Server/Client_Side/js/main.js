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
    handleUsersAndGameId('StartGame', gameId, users);
});

// Add users to DOM
function handleUsersAndGameId(eventType, gameId, users) {
    console.log('This made the Call:', eventType);
    console.log('Client Game ID:', gameId);
    const usernames = users.map(user => user.username).join(', ');
    console.log('Client Connected Users:', usernames);
}

// Prompt the user before leaving the game
$('#Quit').on('click', function (event) {
    event.preventDefault();
    const leaveRoom = confirm('Are you sure you want to quit the game?');
    if (leaveRoom) {
        window.location = '../index.html';
    }
});

// Handle brand submission
$('#Submit_Brand').on('click', function (event) {
    event.preventDefault();
    const input = $('#brandName').val();
    if (input === 'Audi') {
        console.log('Correct Answer!!');
    }
});

function StartGameLoop(users, gameId, limit, clearTimeouts) {
    document.getElementById('Add_Contestants').textContent = "CONTESTANTS ARRIVED!!";
    if (clearTimeouts == true) {
      clearTimeouts();
      return;
    }
    if (users == undefined || users.length == 0) {
      return;
    }
    var winner = users[0];
    var breakOut = false;
    var arrayTimeoutReferences = [];
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
        } else {
            document.getElementById('LoadingScreen').style.display = 'none';
            document.getElementById('DisplayStuff').style.display = 'none';
            document.getElementById('Landing_div').style.display = 'none';
            document.getElementById('gameOver').style.display = 'inline-block';
            document.getElementById('InTheGame').style.display = 'none';
        }
    }
    function clearTimeouts() {
        for (var i = 0; i < arrayTimeoutReferences.length; i++) {
            clearTimeout(arrayTimeoutReferences[i]);
        }
        arrayTimeoutReferences = []; // Reset the timeout references array
        breakOut = true;
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
                console.log(images);
                console.log("The Game will start in 5 Seconds!");
                document.getElementById('Add_Contestants').textContent = users.join(' VS ');
                toddle('DisplayStuff');
                if(breakOut == false){
                    timeoutReference = setTimeout(function() {
                        console.log("Displaying Image ==> ", 0);
                        toddle('InTheGame');
                        document.getElementById('imagelogo').src = images[0].image_url;
                    }, 5000);
                    arrayTimeoutReferences.push(timeoutReference);
                }
                for (var j = 1; j < response.length; j++) {
                    if(breakOut == false){
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
                                    toddle('InTheGame');
                                    document.getElementById('imagelogo').src = images[j].image_url;
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
                                    toddle('InTheGame');
                                    document.getElementById('imagelogo').src = images[j].image_url;
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
