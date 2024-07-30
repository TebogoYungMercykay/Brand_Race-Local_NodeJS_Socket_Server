const GameUsers = [];
// Join currentUser to Loop
function JoinLoop(id, username, gameId) {
    const currentUser = { id, username, gameId };
    GameUsers.push(currentUser);
    return currentUser;
}

function getUniqueGameIDs(){
    const uniqueGameIds = [...new Set(GameUsers.map(user => user.gameId))];
    return uniqueGameIds;
}

function GamesAlone(){
    const gameIDs = getUniqueGameIDs();
    gameIDs.forEach(gameID => {
        var Users = getUsersGameID(gameID);
        console.log('\nGame ID: ', gameID);
        var userNames = Users.map(user => user.username).join(', ');
        console.log('Players: ', userNames);
    });
}

function allGamePlayers() {
    GameUsers.forEach(user => {
        console.log(`${user.username}\t${user.gameId}\t${user.id}`);
    });
}

// Get current currentUser
function getCurrentUser(id) {
    return GameUsers.find(currentUser => currentUser.id === id);
}

// Get current currentUser
function getCurrentUser(username) {
    return GameUsers.find(currentUser => currentUser.username === username);
}

function getGameID(username) {
    var uu = GameUsers.find(currentUser => currentUser.username === username);
    return uu.gameId;
}

function RemoveUser(username) {
    var user = getCurrentUser(username);
    if (user !== undefined) {
        LeaveGame(user.gameId);
        return 1;
    }
    return -1;
}

// User leaves Loop
function LeaveGame(id) {
    const index = GameUsers.findIndex(currentUser => currentUser.id === id);
    if (index !== -1) {
        return GameUsers.splice(index, 1)[0];
    }
    return -1;
}

// Get gameId GameUsers
function getUsersGameID(gameId) {
    return GameUsers.filter(currentUser => currentUser.gameId === gameId);
}

// Add users to DOM
function UsersAndRooms(fun, users, gameId) {
    console.log('This made the Call: ', fun);
    console.log('Game ID:', gameId);
    var userNames = users.map(user => user.username).join(', ');
    console.log('Users:', userNames);
}

module.exports = { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID, allGamePlayers, GamesAlone, RemoveUser, getGameID };
