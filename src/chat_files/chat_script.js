/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var socket = io();
var n;
var to = "";
var actualChat = [];
// TODO Init()

// socket.emit("id-req", 1)
// socket.on("id-resp", function(data){console.log(data)});

// socket.emit("chat-page-init", function(){})
var name = name;

socket.emit('data-on-login-req', name);

// Interfaccia utente loggato.

    
    $("#loggedAs").text(name);
    
    $("#mainInput").hide();
    $("#friendsBar").toggleClass("disabled");
    $("#friendsReqBar").toggleClass("disabled");
    $("#searchReqBar").toggleClass("disabled");
    $("#chatDiv").show();
    $("#messagesDiv").show();
    $("#mainSend").show();
    $("#mainChat").show();




$("#remov").click(function () {
    $("#firststyle").remove();
});

function searchFrnd() {
    input = document.getElementById("userSearchField").value;
    socket.emit('search request', [input, name]);
}

function friendHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm startChat'data-name='" + name + "'>Start Chat</button>   <button type='button' class='btn btn-primary btn-sm removeFriendBtn' data-name='" + name + "'>Remove Friend</button></li>";
}

function searchMatchHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm sendRequest' data-name='" + name + "'>Send friend request</button>";
}

function friendReqHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm acceptRequest' data-name='" + name + "'>Accept</button><button type='button' class='btn btn-primary btn-sm denyRequest' data-name='" + name + "'>Deny</button>";
}

function friendReqSendedHtmlBuilder(name) {
    return "<li class = 'friendSectionLi'>" + name + "                 <button type='button' class='btn btn-primary btn-sm deleteRequest' data-name='" + name + "'>Delete Request</button>";
}

$("body").on("click", ".sendRequest", function (el) {
    $('#reqFriendsSendedUl').show();
    $('#reqFriendsSendedUl').append(friendReqSendedHtmlBuilder($(el.target).attr("data-name")));
   
    socket.emit('send-friend-request', [$(el.target).attr("data-name"), name]);
});

$("body").on("click", ".removeFriendBtn", function (el) {
    socket.emit('remove-friend-request', [$(el.target).attr("data-name"), name]);

    for (var i = 0; i < $("#chatList").children().length; i++) {
        if ($("#chatList").children()[i].innerHTML == $(el.target).attr("data-name")) {
            $("#chatLiId" + i).remove();
        }
    }

    if (to == $(el.target).attr("data-name")) {
        to = "";
        $('#messages').empty();
    }
});

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
    console.log("ok " + $(el.target).attr("data-name"))
});

$("body").on("click", ".denyRequest", function (el) { // Accettazione della richiesta di amicizia
    socket.emit('frndRq-refused', [$(el.target).attr("data-name"), name]);
});

$("body").on("click", ".startChat", function (el) { // Start chat button start-chat
    to = $(el.target).attr("data-name");
    var bool = false;
    var len;

    if (actualChat != null && actualChat.length != 0) {
        len = actualChat.length;

        actualChat.forEach(function (token) {
            if (token == to) {
                bool = true;
            }
        });
    } else if (actualChat == null || actualChat.length == 0) {
        bool = false;
        len = 0
    }

    if (bool) {
        if (actualChat.indexOf(to) < 0) { actualChat.push(to); }
        to = $(el.target).attr("data-name");
        // Toggle class nav
        // Trigger click
    } else {
        if (actualChat.indexOf(to) < 0) { actualChat.push(to); }
        // Toggle class nav
        // Trigger nav
        $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + len + "' >").text($(el.target).attr("data-name")));
        to = $(el.target).attr("data-name");
    }

    $("#friendsBar").toggleClass("show");
    $("#friendsBar").toggleClass("active");
    $("#chatBar").toggleClass("show");
    $("#chatBar").toggleClass("active");
    $("#sectionFriends").toggleClass("show");
    $("#sectionFriends").toggleClass("active");
    $("#home").toggleClass("active");
    $("#home").toggleClass("show");
    $('#messages').empty();

    socket.emit('chat-request', [name, to]);
});

$("#signOutBtn").on('click', function () {
    console.log("disconnection...")
    socket.emit('sign-out', []);

    $("#loggedAs").text("");
    $("#mainInput").show();
    $("#friendsBar").toggleClass("disabled");
    $("#friendsReqBar").toggleClass("disabled");
    $("#searchReqBar").toggleClass("disabled");
    $("#chatDiv").hide();
    $("#messagesDiv").hide();
    $("#mainSend").hide();
});

$('#formId').submit(function () {
    if (to != "") {
        if (actualChat.indexOf(to) < 0) { actualChat.push(to) };
        socket.emit('chat message', [name, $('#sendMessageBtn').val(), to]);
        // TODO cambiare id input
        $('#messages').append($('<li>').text("@you >>> " + $('#sendMessageBtn').val()));
    }
    $('#sendMessageBtn').val('');
    return false;
});




// La registrazione è avvenuta con successo,
// abilitazione funzionalità di chat, friends, search user e friend requests.

socket.on('data-on-login-resp', function (data) {
    $('#reqFriendsSendedUl').hide();
    $('#reqFriendsUl').hide();
    // Popolo i nav
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

    // Nav Friends Request (inBox)
    var frndReqList = data[0]["inBox"];
    frndReqList.forEach(function (token) {
        $('#reqFriendsUl').show();
        $('#reqFriendsUl').append(friendReqHtmlBuilder(token));
    });

    // Nav Friends Request (sended)
    var frndReqSendedList = data[0]["sended"];
    frndReqSendedList.forEach(function (token) {
        $('#reqFriendsSendedUl').show();
        $('#reqFriendsSendedUl').append(friendReqSendedHtmlBuilder(token));
    });

    // Nav Chat
    if (data[2] == null) {
        actualChat = [];
    } else {
        data[2].forEach(function (token) {
            var toPush = Object.keys(token)[0];
            actualChat.push(toPush);
        });
    }

    $('#chatList').empty();
    for (var i = 0; i < actualChat.length; i++) {
        var nm = Object.keys(data[2][i]);
        $('#chatList').append($("<li class='chatLi' id = 'chatLiId" + i + "' >").text(nm[0]));
    }

});

socket.on('refresh-frnd&frndreq-bar', function (data) {
    console.log("refresh ok...\n" + data)

    $('#reqFriendsSendedUl').hide();
    $('#reqFriendsUl').hide();
    frndList = data[1];

    data[0]["inBox"] == undefined ? frndReqList = [] : frndReqList = data[0]["inBox"];
    data[1]["sended"] == undefined ? frndReqSendedList = [] : frndReqSendedList = data[1]["sended"];

    $('#reqFriendsUl').empty();
    $('#chatFriends').empty(); // TODO cambiare id ul friends

    frndList.forEach(function (token) {
        $('#chatFriends').append(friendHtmlBuilder(token));
    });

    frndReqList.forEach(function (token) {
        $('#reqFriendsUl').show();
        $('#reqFriendsUl').append(friendReqHtmlBuilder(token));
    });

    frndReqSendedList.forEach(function (token) {
        $('#reqFriendsSendedUl').show();
        $('#reqFriendsSendedUl').append(friendReqHtmlBuilder(token));
    });
});

socket.on('search response', function (matchArray) {
    $('#searchMatchUl').empty();
    matchArray.forEach(function (token) {
        $('#searchMatchUl').append(searchMatchHtmlBuilder(token));
    });
});

socket.on('friendReq', function (friendReqData) {
    $('#reqFriendsUl').show();
    $('#reqFriendsUl').append(friendReqHtmlBuilder(friendReqData));
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

socket.on('chat message', function (msg) {
    console.log("received message")
    var bool = false;
    for (var i = 0; i < actualChat.length; i++) {
        var nm = actualChat[i];
        if (nm == msg[0]) {
            bool = true;
        }
    }
    if (bool) { // Esiste nel chat box
        if (actualChat.indexOf(msg[0]) < 0) {
            actualChat.push(msg[0]);
        }
        if (to == msg[0]) { // La chat è attiva sul mittente.
            $('#messages').append($('<li>').text("@" + msg[0] + ">>> " + msg[1]));
            window.scrollTo(0, document.body.scrollHeight);
        } else { // La chat non è attiva sul mittente, notifico.
            var a = $("#chatList").children().length;

            for (var index = 0; index < a; index++) {
                if ($("#chatList").children()[index].innerHTML == msg[0]) {
                    $("#chatList").children()[index].className = "chatLiNotified";
                }
            }
        }
    } else { // Non esiste nel chat box
        // Creo la chat.
        $('#chatList').append($("<li class='chatLiNotified' id = 'chatLiId" + $("#chatList").children().length + "' >").text(msg[0]));
        $("#chatList").children()[$("#chatList").children().length - 1].className = "chatLiNotified";
    }
});

socket.on('friend-removed', function (from) {

});

//name = $("#connectBtn").val();


// Richiedo le mie informazioni base.


