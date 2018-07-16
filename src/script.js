var socket = io();
var name = ""
var n;
var to = "";

$("body").on("click", [".chatLi", ".chatLiNotified"], function (el) {
    // TODO Cambiare colore li una volta cliccato.
    to = $(el.target).text();
    socket.emit('chat-request', [name, to]);
    var a = $("#chatList").children().length;

    console.log($(el.target).attr("class"))
    if( $(el.target).attr("class") == "chatLiNotified"){

        $(el.target).toggleClass("chatLiNotified")
        $(el.target).toggleClass("chatLi")
    }
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


    } else {
        alert("name already present")
    }

    socket.on('chat message', function (msg) {
        if (to == msg[0]) {
            $('#messages').append($('<li>').text("@" + msg[0] + ">>> " + msg[1]))
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            var a = $("#chatList").children().length;

            for (var index = 0; index < a; index++) {
                if ($("#chatList").children()[index].innerHTML == msg[0]) {
                    $("#chatList").children()[index].className = "chatLiNotified";
                    
                }
            }
        }
    });
    socket.on('chat-list', function (msg) {
        console.log(msg[2])
        $('#messages').empty();
        for (var i = 0; i < msg[0].length; i++) {
            if (!msg[1][i]) {
                $('#messages').append($('<li>').text("@" + to + ">>> " + msg[0][i]))
                window.scrollTo(0, document.body.scrollHeight);
            } else {
                $('#messages').append($('<li>').text("@you>>> " + msg[0][i]))
                window.scrollTo(0, document.body.scrollHeight);
            }
        }
    });

    socket.on("reg", function (msg) {
        $('#messages').append($('<li>').text(msg));
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on("user logged", function (msg) {
        $('#chatList').empty();
        for (var i = 0; i < msg.length; i++) {
            if (msg[i]["name"] != name && msg[i]["name"] != "") {

                $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + i + "' >").text(msg[i]["name"]))

            }
        }
    });
});

$("#regBtn").on('click', function () {

    socket.emit('registration', [$("#input").val(), n]);
})

function test() {


}