const GameUsers = [];

// Join currentUser to Loop
function JoinLoop(id, username, gameId) {
    const currentUser = { id, username, gameId };
    GameUsers.push(currentUser);
    return currentUser;
}

// Get current currentUser
function getCurrentUser(id) {
    return GameUsers.find(currentUser => currentUser.id === id);
}

// Get current currentUser
function getCurrentUser(username) {
    return GameUsers.find(currentUser => currentUser.username === username);
}

function UserExists(username, gameId) {
    return ((getCurrentUser(username)==undefined) && (getCurrentUser(gameId)==undefined));
}

// User leaves Loop
function LeaveGame(id) {
    const index = GameUsers.findIndex(currentUser => currentUser.id === id);
    if (index !== -1) {
        return GameUsers.splice(index, 1)[0];
    }
}

// Get gameId GameUsers
function getUsersGameID(gameId) {
    return GameUsers.filter(currentUser => currentUser.gameId === gameId);
}

// Add users to DOM
function UsersAndRooms(users, gameId) {
    console.log('Game ID:', gameId);
    var userNames = users.map(user => user.username).join(', ');
    console.log('Users:', userNames);
}

module.exports = { UsersAndRooms, JoinLoop, getCurrentUser, LeaveGame, getUsersGameID, UserExists };