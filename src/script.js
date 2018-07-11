var socket = io();
var name = ""
var n;
var to = "";


$('form').submit(function () {
    socket.emit('chat message', [name, $('#m').val(), n]);
    $('#m').val('');
    return false;
});

$("li").click(function () {
    alert("ok")
    //    $("#chatLi").css("background-color", "gray");
    to="";
})
$("li").on("click", function () {
    alert("ok")
    //    $("#chatLi").css("background-color", "gray");
    to="";
})

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
    }else{
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
                $('#chatList').append($('<li id = "chatLi">').text(msg[i]["name"]))
            }
        }
        $("#chatLi").click(function () {
            alert("ok")
            //    $("#chatLi").css("background-color", "gray");
            to="";
        })
    });


})

$("#regBtn").on('click', function () {
    
    socket.emit('registration', [$("#input").val(), n]);
})

