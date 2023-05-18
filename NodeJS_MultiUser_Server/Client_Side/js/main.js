// Extracting Username and Room from URL
const { username, gameId } = Qs.parse(location.search,
    { ignoreQueryPrefix: true }
);

// console.log(username, gameId);
const mySocket = io();

// Enter Race
mySocket.emit('EnterRace', { username, gameId });

// Add users to DOM
function UsersAndRooms(users, gameId) {
    console.log(gameId);
    var Users = '';
    users.forEach((user) => {
        Users += user.username + ", ";
    });
    console.log(Users);
}

//Prompt the user before leave chat gameId
$('#Quit').click(function (event) {
    event.preventDefault();
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {
    }
});

// Get gameId and users
mySocket.on('userAlreadyExists', (username) => {
    console.log('User already exists with Username: ', username);
    window.location = '../index.html';
});

// Get gameId and users
mySocket.on('GamingUsers', ({ gameId, users }) => {
    UsersAndRooms(gameId, users);
});

// Print Message from server
mySocket.on('message', message => {
    console.log('Message: ', message);
});
mySocket.on('InTheGame', object => {
    console.log('Update: ', object.gameId);
    UsersAndRooms(object.users, object.gameId);
});

// Still Yet to Implement
$('#Submit_Brand').on('click', function (event) {
    event.preventDefault();
    var input = $('#brandName').text();
    if(input == 'Audi'){
        console.log('Correct Answer!!');
    }
});