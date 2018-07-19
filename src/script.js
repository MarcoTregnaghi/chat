/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 */

var socket = io();
var name = ""
var n;
var to = "";

function friendHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm' >Start Chat</button>   <button type='button' class='btn btn-primary btn-sm'>Remove Friend</button></li>";
}


function searchMatchHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm sendRequest' data-name='"+name+ "'>Send friend request</button>";
}

function friendReqHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm acceptRequest' data-name='"+name+ "'>Accept</button><button type='button' class='btn btn-primary btn-sm denyRequest' data-name='"+name+ "'>Deny</button>";
}

$("body").on("click", ".sendRequest", function (el) {
    console.log("sended to " + $(el.target).attr("data-name"))
    socket.emit('send-friend-request', [ $(el.target).attr("data-name"), name ]);
});
/*

var h = $("body").css('height');
var w = $("body").css('width');

var hh = "";
for(var a = 0;a< h.length-2; a++){
    hh += h[a];
}
hh = parseInt(hh)
hh= hh-200;
hh = hh.toString();
hh = hh + "px";

*/


//$("#mainChat").css('height', hh)
//$("#tab-content").css('witdh', w)


// TODO valorizzare chatList con chat{}


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

$("body").on("click", ".acceptRequest", function (el) { // Accettazione della richiesta
    socket.emit('frndRq-accepted', [$(el.target).attr("data-name"), name]);
});

socket.on('refresh-frnd&frndreq-bar', function(data){
    frndList = data[1];
    frndReqList = data[0];

    console.log(data)

    $('#reqFriendsUl').empty();
    $('#chatFriends').empty(); // TODO cambiare id ul friends

    frndList.forEach(function(token){
        $('#chatFriends').append(friendHtmlBuilder(token));
    });
    frndReqList.forEach(function(token){
        $('#reqFriendsUl').append(friendReqHtmlBuilder(token));
    });
});



$('#formId').submit(function () {
    if (to != "") {
        socket.emit('chat message', [name, $('#sendMessageBtn').val(), to]);
        $('#messages').append($('<li>').text("@you >>> " + $('#sendMessageBtn').val()));
    }
    $('#sendMessageBtn').val('');
    return false;
});



socket.on("getN", function (number) {
    n = number;
});

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        $("#mainInput").hide();
        $("#friendsBar").toggleClass("disabled");
        $("#friendsReqBar").toggleClass("disabled");
        $("#searchReqBar").toggleClass("disabled");
        $("#chatDiv").show();
        $("#messagesDiv").show();
        $("#mainSend").show();
        name = $("#connectBtn").val();
    } else {
        alert("name already present");
    }

 

    socket.on('search response', function (matchArray) {
        console.log(matchArray); console.log("ok");
        $('#searchMatchUl').empty();
        matchArray.forEach(function (token) {
            $('#searchMatchUl').append(searchMatchHtmlBuilder(token));
        });
    });

    socket.on('friendReq', function(friendReqData){
        $('#reqFriendsUl').append(friendReqHtmlBuilder(friendReqData));
        $('#reqFriendsUl').append();
        console.log("i received req from " + friendReqData);
    });

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
    console.log("added?");


    socket.emit('registration', [$("#connectBtn").val(), n]);
});

function test() {
}

function searchFrnd() {
    input = document.getElementById("userSearchField").value;
    socket.emit('search request', [input, name]);
}