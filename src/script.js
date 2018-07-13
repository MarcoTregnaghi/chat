var socket = io();
var name = ""
var n;
var to = "";

$("body").on("click", ".chatLi", function (el) {
    // TODO Cambiare colore li una volta cliccato.
    to = $(el.target).text();
    socket.emit('chat-request', [name, to]);
});

$('form').submit(function () {
    if (to != "") {
        socket.emit('chat message', [name, $('#m').val(), to]);
        $('#messages').append($('<li>').text("@you >>> " + $('#m').val()));
    }
    $('#m').val('');
    return false;
});

socket.on("getN", function (number) {
    n = number;
});

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        $("#chatDiv").show();
        $("#messagesDiv").show();
        $("#mainSend").show();
        name = $("#input").val();
        alert("done")
        
    } else {
        alert("name already present")
    }

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text("@" + msg[0] + ">>> " + msg[1]))
        window.scrollTo(0, document.body.scrollHeight);

    });
    socket.on('chat-list', function (msg) {
        alert(msg);
        for (var i = 0; i < msg[0].length; i++) {
            if(msg[1][i]){
                $('#chatList').append($("<li class='chatLi'>").text("@you>>> " + msg[0][i]))
            }else{
                $('#chatList').append($("<li class='chatLi'>").text("@" + to + ">>> " + msg[0][i]))
            }
        }
        console.log(msg)
    });
    socket.on("reg", function (msg) {
        $('#messages').append($('<li>').text(msg));
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on("user logged", function (msg) {
        $('#chatList').empty();
        for (var i = 0; i < msg.length; i++) {
            if (msg[i]["name"] != name && msg[i]["name"] != "") {
                $('#chatList').append($("<li class='chatLi'>").text(msg[i]["name"]))
            }

        }

    });


});

$("#regBtn").on('click', function () {

    socket.emit('registration', [$("#input").val(), n]);
})

