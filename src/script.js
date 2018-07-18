/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 */

var socket = io();
var name = ""
var n;
var to = "";

function friendHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name +  "<button type='button' class='btn btn-primary btn-sm' >Start Chat</button>   <button type='button' class='btn btn-primary btn-sm'>Remove Friend</button></li>";
}
// var h = $("body").css('height');
// var w = $("body").css('width');

// var hh = "";
// for(var a = 0;a< h.length-2; a++){
//     hh += h[a];
// }
// hh = parseInt(hh)
// hh= hh-200;
// hh = hh.toString();
// hh = hh + "px";

// //$("#mainChat").css('height', hh)
// //$("#tab-content").css('witdh', w)

$("body").on("click", [".chatLi", ".chatLiNotified"], function (el) {
    // TODO Cambiare colore li una volta cliccato.
    if ($(el.target).attr("class") == "chatLiNotified" || $(el.target).attr("class") == "chatLi") {
        to = $(el.target).text();
        socket.emit('chat-request', [name, to]);
        var a = $("#chatList").children().length;

        console.log($(el.target).attr("class"))
        if ($(el.target).attr("class") == "chatLiNotified") {
            $(el.target).toggleClass("chatLiNotified")
            $(el.target).toggleClass("chatLi")
        }
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
        $("#mainInput").hide();

        $("#chatDiv").show();
        $("#messagesDiv").show();
        $("#mainSend").show();
        name = $("#connectBtn").val();
    } else {
        alert("name already present")
    }

    socket.on('chat message', function (msg) {
        if (to == msg[0]) {
            console.log("ok message")
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
    console.log("added?")
    $('#chatFriends').append(friendHtmlBuilder("newsdf "));

    socket.emit('registration', [$("#connectBtn").val(), n]);
})

function test() {


}


function searchFrnd() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("frndSearchField");
    filter = input.value.toUpperCase();
    ul = document.getElementById("chatFriends");
    li = ul.getElementsByClassName("friendSectionLi");

    for (i = 0; i < li.length; i++) {
        
        var val = li[i].innerText.split(" ")[0].toUpperCase()

        if (val.includes(filter) && val!= "") {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
    
}