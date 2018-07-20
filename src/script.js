/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var socket = io();
var name = ""
var n;
var to = "";

var chat;

function test() {
}

function searchFrnd() {
    input = document.getElementById("userSearchField").value;
    socket.emit('search request', [input, name]);
}

function friendHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm startChat'data-name='" + name + "'>Start Chat</button>   <button type='button' class='btn btn-primary btn-sm'>Remove Friend</button></li>";
}

function searchMatchHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm sendRequest' data-name='" + name + "'>Send friend request</button>";
}

function friendReqHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm acceptRequest' data-name='" + name + "'>Accept</button><button type='button' class='btn btn-primary btn-sm denyRequest' data-name='" + name + "'>Deny</button>";
}

$("body").on("click", ".sendRequest", function (el) {
    console.log("sended to " + $(el.target).attr("data-name"))
    socket.emit('send-friend-request', [$(el.target).attr("data-name"), name]);
});

// TODO valorizzare chatList con chat{}

$("body").on("click", [".chatLi", ".chatLiNotified"], function (el) {
    // TODO Cambiare colore li una volta cliccato.
    if ($(el.target).attr("class") == "chatLiNotified" || $(el.target).attr("class") == "chatLi") {
        to = $(el.target).text();
        socket.emit('chat-request', [name, to]);

        if ($(el.target).attr("class") == "chatLiNotified") {
            $(el.target).toggleClass("chatLiNotified")
            $(el.target).toggleClass("chatLi")
        }
    }
});

$("body").on("click", ".acceptRequest", function (el) { // Accettazione della richiesta di amicizia
    socket.emit('frndRq-accepted', [$(el.target).attr("data-name"), name]);
});

$("body").on("click", ".startChat", function (el) { // Start chat button start-chat
    console.log("starting chat")
    to = $(el.target).attr("data-name");
    var bool = true;
    var len;
    if (chat != null) {
        len = chat.length;

        chat.forEach(function (token) {
            if (token["name"] == to) {
                bool = false;
            }
        });
    } else if (chat == null) { bool = false; len = 0 }

    if (bool) {
        to = $(el.target).attr("data-name");
        // Toggle class nav
        // Trigger click
    } else {
        // Toggle class nav
        // Trigger nav
        $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + len + "' >").text($(el.target).attr("data-name")));
        to = $(el.target).attr("data-name");
    }

    $("#friendsBar").toggleClass("show")
    $("#friendsBar").toggleClass("active")
    $("#chatBar").toggleClass("show")
    $("#chatBar").toggleClass("active")

    $("#sectionFriends").toggleClass("show")
    $("#sectionFriends").toggleClass("active")
    $("#home").toggleClass("active")
    $("#home").toggleClass("show")
    // socket.emit('start-chat', [name, to]);

    // 
});

/*
socket.on('start-chat-response', function (data) {
    if (data) {
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
    } else {

    }


});*/



$("#regBtn").on('click', function () {
    socket.emit('registration', [$("#connectBtn").val(), n]);
});

$('#formId').submit(function () {
    if (to != "") {
        socket.emit('chat message', [name, $('#sendMessageBtn').val(), to]);
        $('#messages').append($('<li>').text("@you >>> " + $('#sendMessageBtn').val()));
    }
    $('#sendMessageBtn').val('');
    return false;
});


socket.on("getN", function (number) { // TODO cambiare nome evento
    n = number;
});
var tt;
socket.on('data-on-login-resp', function (data) {
    // Popolo i nav
    console.log(data)

    data.forEach(function (token) {
        if (token == null) {
            token = [];
        }
    });

    // Nav Friends
    var frndList = data[1];
    frndList.forEach(function (token) {
        $('#chatFriends').append(friendHtmlBuilder(token));
    });

    // Nav Friends Request
    var frndReqList = data[0];
    frndReqList.forEach(function (token) {
        $('#reqFriendsUl').append(friendReqHtmlBuilder(token));
    });

    // Nav Chat
    chat = data[2]
    $('#chatList').empty();
    if (chat != null) {
        for (var i = 0; i < chat.length; i++) {
            var nm = Object.keys(data[2][i]);
            $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + i + "' >").text(nm[0]));
        }
    }
});

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        name = $("#connectBtn").val();
        $("#loggedAs").text(name);
        $("#mainInput").hide();
        $("#friendsBar").toggleClass("disabled");
        $("#friendsReqBar").toggleClass("disabled");
        $("#searchReqBar").toggleClass("disabled");
        $("#chatDiv").show();
        $("#messagesDiv").show();
        $("#mainSend").show();
        console.log("main data req sended")
        socket.emit('data-on-login-req', name);

    } else {
        alert("name already present");
    }

    // *************Events*************

    socket.on('refresh-frnd&frndreq-bar', function (data) {
        console.log("DONE")
        frndList = data[1];
        data[0] == null ? frndReqList = [] : frndReqList = data[0];

        console.log(data)

        $('#reqFriendsUl').empty();
        $('#chatFriends').empty(); // TODO cambiare id ul friends

        frndList.forEach(function (token) {
            $('#chatFriends').append(friendHtmlBuilder(token));
        });
        frndReqList.forEach(function (token) {
            $('#reqFriendsUl').append(friendReqHtmlBuilder(token));
        });
    });

    socket.on('search response', function (matchArray) {
        $('#searchMatchUl').empty();
        matchArray.forEach(function (token) {
            $('#searchMatchUl').append(searchMatchHtmlBuilder(token));
        });
    });

    socket.on('friendReq', function (friendReqData) {
        $('#reqFriendsUl').append(friendReqHtmlBuilder(friendReqData));
        $('#reqFriendsUl').append();
        console.log("i received req from " + friendReqData);
    });

    socket.on('chat message', function (msg) { // DA RIVEDERE LUNEDÌ
        var bool = false;

        for (var i = 0; i < chat.length; i++) {
            var nm = Object.keys(chat[2][i]);
            if(nm.indexOf(msg[0]) >= 0){
                bool = true;
            }
        }

        if (bool) { // Esiste nel chat box
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
        }else{ // Non esiste nel chat box
            $('#chatList').append($("<li class='chatLiNotified' id = 'chatLiId" + len + "' >").text(msg[0]));
        }
    });

    socket.on('chat-list', function (msg) {
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
    // TODO Switch to socket on friend logged if chat

    socket.on("friend-logged", function (msg) {
        $('#chatList').empty();
        for (var i = 0; i < msg.length; i++) {
            if (msg[i]["name"] != name && msg[i]["name"] != "") {
                $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + i + "' >").text(msg[i]["name"]))
            }
        }
    });


    // *********************************
});