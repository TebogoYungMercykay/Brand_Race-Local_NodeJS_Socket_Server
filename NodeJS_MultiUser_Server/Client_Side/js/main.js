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

// TODO: Must Refine This Function, Which Is Basically an Implementation of The Game Loop.
// TODO: The Intervals are Perfect, I just need to make sure they are Using Images from the API on the Wheatley server and not my Local API
// function StartGameLoop(users, gameId, limit, clearTimeouts) {
//     if (clearTimeouts == true) {
//         clearTimeouts();
//         return;
//     }
//     document.getElementById('Add_Contestants').textContent = users.map(user => user.username).join(' VS ');
//     var breakOut = false;
//     var arrayTimeoutReferences = [];
//     function toddle(id){
//         if(id == 'LoadingScreen'){
//             document.getElementById('LoadingScreen').style.display = 'block';
//             document.getElementById('DisplayStuff').style.display = 'none';
//             document.getElementById('logoContainer').style.display = 'none';
//             document.getElementById('gameOver').style.display = 'none';
//         } else if(id == 'DisplayStuff') {
//             document.getElementById('LoadingScreen').style.display = 'none';
//             document.getElementById('DisplayStuff').style.display = 'block';
//             document.getElementById('logoContainer').style.display = 'none';
//             document.getElementById('gameOver').style.display = 'none';
//         } else if(id == 'logoContainer') {
//             document.getElementById('LoadingScreen').style.display = 'none';
//             document.getElementById('DisplayStuff').style.display = 'none';
//             document.getElementById('logoContainer').style.display = 'block';
//             document.getElementById('gameOver').style.display = 'none';
//         } else {
//             document.getElementById('LoadingScreen').style.display = 'none';
//             document.getElementById('DisplayStuff').style.display = 'none';
//             document.getElementById('logoContainer').style.display = 'none';
//             document.getElementById('gameOver').style.display = 'block';
//         }
//     }
//     function clearTimeouts() {
//         for (var i = 0; i < arrayTimeoutReferences.length; i++) {
//             clearTimeout(arrayTimeoutReferences[i]);
//         }
//         arrayTimeoutReferences = []; // Reset the timeout references array
//         breakOut = true;
//     }

//     function StartGameLoopNow(limit) {
//         jsonObject = {
//             "limit":limit
//         }
//         var json = JSON.stringify(jsonObject);
//         // console.log(json);
//         $.ajax({
//             url: "http://localhost/API_MYSQL_DATABSE/php/hwa_api.php/GetRandomBrands",
//             method: "POST",
//             data: json,
//             success: function(response) {
//                 var images = response.data;
//                 var timeoutReference = '';
//                 console.log(images);
//                 console.log("The Game will start in 5 Seconds!");
//                 toddle('DisplayStuff');
//                 if(breakOut == false){
//                     timeoutReference = setTimeout(function() {
//                         console.log("Displaying Image ==> ", 0);
//                         document.getElementById('image').src = images[0].image_url;
//                         toddle('ImageDiv');
//                     }, 5000);
//                     arrayTimeoutReferences.push(timeoutReference);
//                 }
//                 for (var j = 1; j < response.length; j++) {
//                     if(breakOut == false){
//                         if(j == 1){
//                             (function(j) {
//                                 var time = 25000;
//                                 timeoutReference = setTimeout(function() {
//                                     console.log("Displaying Loading Screen....", 0);
//                                     toddle('LoadingScreen');
//                                 }, time-5000);
//                                 arrayTimeoutReferences.push(timeoutReference);
//                                 timeoutReference = setTimeout(function() {
//                                     console.log("Displaying Image ==> ", j);
//                                     document.getElementById('image').src = images[j].image_url;
//                                     toddle('ImageDiv');
//                                 }, time);
//                                 arrayTimeoutReferences.push(timeoutReference);
//                             })(j);
//                         } else {
//                             (function(j) {
//                                 var time2 = 25000 + (j-1)*20000;
//                                 timeoutReference = setTimeout(function() {
//                                     console.log("Displaying Loading Screen....", j-1);
//                                     toddle('LoadingScreen');
//                                 }, time2-5000);
//                                 arrayTimeoutReferences.push(timeoutReference);
//                                 timeoutReference = setTimeout(function() {
//                                     console.log("Displaying Image ==> ", j);
//                                     document.getElementById('image').src = images[j].image_url;
//                                     toddle('ImageDiv');
//                                 }, time2);
//                                 arrayTimeoutReferences.push(timeoutReference);
//                             })(j);
//                         }
//                     }
//                 }
//                 if(breakOut == false){
//                     timeoutReference = setTimeout(function(){
//                         console.log("Done Now!!!");
//                         toddle('gameOver');
//                     },120000);
//                     arrayTimeoutReferences.push(timeoutReference);
//                 }
//             },
//             error: function(jqXHR, textStatus, errorThrown) {
//                 console.log(errorThrown);
//             }
//         });
//     }
//     StartGameLoopNow(limit);
// }
