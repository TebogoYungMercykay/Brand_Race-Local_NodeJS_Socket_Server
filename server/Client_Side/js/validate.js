// * Man City Won Against Real Madrid On This Day: 2023/05/17 :)
function validateInputs(){
    document.getElementById('username').style.border = '1px solid grey';
    document.getElementById('gameId').style.border = '1px solid grey';
    var username = document.getElementById('username').value;
    var gameId = document.getElementById('gameId').value;
    var alphanumericRegex = /^[a-zA-Z0-9]+$/;
    // Validate username
    if(username.length < 2) {
        document.getElementById('username').style.border = '1px solid red';
        return false;
    } else {
        document.getElementById('username').style.border = '1px solid green';
    }
    // Validate gameID
    if (gameId.length !== 10 || !alphanumericRegex.test(gameId)) {
        document.getElementById('gameId').style.border = '1px solid red';
        return false;
    } else {
        document.getElementById('gameId').style.border = '1px solid green';
    }
    return true;
}

$(document).ready(function (){
    // Generating a Random Alphanumeric string of Length 10
    $('#generateID').click(function (event) {
        event.preventDefault();
        var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        var randomString = '';
        var length = 10;
        for (var i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        $('#gameId').text(randomString);
        $('#gameId').val(randomString);
    });
});