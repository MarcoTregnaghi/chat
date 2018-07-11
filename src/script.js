var socket = io();
var name = ""
var n;
var to = "";

$("body").on("click", ".chatLi", function (el) {
    //    $("#chatLi").css("background-color", "gray");
    to = $(el.target).text();
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
})

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        $("#chatDiv").show();
        $("#messagesDiv").show();
        $("#mainSend").show();
        name = $("#input").val();
        alert("done")
        for (var i = 0; i < msg[1].length; i++) {
            console.log("added " + msg[1][i]["name"])
        }
    } else {
        alert("name already present")
    }

    socket.on('chat message', function (msg) { // TODO Ciclo for socket eliminare operatore ternario.
        $('#messages').append($('<li>').text("@" + msg[0] + ">>> " + msg[1]))
        window.scrollTo(0, document.body.scrollHeight);

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


})

$("#regBtn").on('click', function () {

    socket.emit('registration', [$("#input").val(), n]);
})

