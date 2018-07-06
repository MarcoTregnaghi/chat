var socket = io();
var name = ""
var n;
$('form').submit(function () {
    socket.emit('chat message', [name, $('#m').val()]);
    $('#m').val('');
    return false;
});

socket.on("getN", function (number) {
    n = number;
})

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        name = $("#input").val();
        alert("done")
        for (var i = 0; i < msg[1].length; i++) {
            console.log("added " + msg[1][i]["name"])
            if (msg[1][i]["name"] != name) {
                $('#chatList').append($('<li id = "chatLi">').text(msg[1][i]["name"]))
                
            }
        }
    }


    socket.on('chat message', function (msg) { // TODO Ciclo for socket eliminare operatore ternario.
        $('#messages').append($('<li>').text("@" + msg[0] + ">>> " + msg[1]))
        window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on("reg", function (msg) {
        $('#messages').append($('<li>').text(msg));
        window.scrollTo(0, document.body.scrollHeight);
    });
}
)

$("#regBtn").on('click', function () {
    socket.emit('registration', [$("#input").val(), n]);
})