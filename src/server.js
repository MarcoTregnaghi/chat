var app = require("express")();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var $ = require('jquery');
var port = 3000;
var lastClient = 0;
var clients = []; //TODO cambiare in onlineclients
var chats = {};
var registeredClients = {};


class Client {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.chat = {};
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function (req, res) {
  res.sendFile(__dirname + '/script.js');
});

app.get('/mainBG.png', function (req, res) {
  res.sendFile(__dirname + '/mainBG.png');
});

io.on('connection', function (socket) {
  io.sockets.connected[socket.id].emit("getN", lastClient);
  lastClient++;
  clients.push({ "id": socket.id, "name": "" })

  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  console.log("[INFO] " + datetime + " user connected");

  socket.on('send-friend-request', function (data) {
    console.log(registeredClients[data[1]]["id"])

    for (var i = 0; i < clients.length; i++) {
      if (data[1] == clients[i]["name"]) {
        io.sockets.connected[clients[i]["id"]].emit('accepted-friendRq', data);
      }
    }
  });

  socket.on('frndRq-accepted', function (data) {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getFullYear() + " @ "
      + currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();

    console.log("[INFO] " + datetime + " friend request accepted from " + data[1] + " to " + data[0]);
    
    // Modifico registeredC
    registeredClients[data[0]]["friendReq"].pop(data[1]);
    registeredClients[data[1]]["friendReq"].pop(data[0]);
    registeredClients[data[1]]["friends"].push(data[0])
    registeredClients[data[0]]["friends"].push(data[1])

    // Notifico
    for (var i = 0; i < clients.length; i++) {
      if (data[0] == clients[i]["name"]) {
        io.sockets.connected[clients[i]["id"]].emit('refresh-frnd&frndreq-bar', [registeredClients[data[0]]["frndReq"], registeredClients[data[0]]["friends"]]);
      } else if (data[1] == clients[i]["name"]) {
        io.sockets.connected[clients[i]["id"]].emit('refresh-frnd&frndreq-bar', [registeredClients[data[1]]["frndReq"], registeredClients[data[1]]["friends"]]);
      }
    }
  });

  socket.on('start-chat', function(data) {
    

  });

  socket.on('registration', function (reqName) {

    if (checkClients(reqName[0], clients)) {
      newName = reqName[0];

      if (!registeredClients[newName]) {
        registeredClients[newName] = { "friendReq": [], "id": socket.id, "friends": [] };
      }

      clients[reqName[1]]["name"] = reqName[0];

      // TODO indagare causa problema:
      //
      //
      // clients[reqName[1]]["name"] = reqName[0];
      //                             ^
      // TypeError: Cannot set property 'name' of undefined

      var currentdate = new Date();  // TODO funzione getOra()
      var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

      console.log("[INFO] " + datetime + " account confirmed: " + reqName[0])

      // reqName[0].toString() = new Client(socket.id, reqName[0]);
      // ***********************

      io.sockets.connected[clients[reqName[1]]["id"]].emit("login", ["done", clients]); // messaggio mirato (id)

      // for (var i = 0; i < clients.length; i++) {
      //   io.sockets.connected[clients[i]["id"]].emit('user logged', clients);
      // }

      // ************************

      socket.on('data-on-login-req', function (name) {
        console.log("received from " + name);
        console.log("\n" + registeredClients[name] + "\n" + registeredClients[name]["friends"] + "\n" + chats[name] + "\n")
        let ret = [registeredClients[name]["friendReq"], registeredClients[name]["friends"], chats[name], registeredClients];
        io.sockets.connected[socket.id].emit('data-on-login-resp', ret);
      });

      socket.on('search request', function (data) {
        var ret = filterOnlineClient(data[0], data[1]);
        io.sockets.connected[socket.id].emit('search response', ret);
      });

      socket.on('chat-request', function (data) {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
          + (currentdate.getMonth() + 1) + "/"
          + currentdate.getFullYear() + " @ "
          + currentdate.getHours() + ":"
          + currentdate.getMinutes() + ":"
          + currentdate.getSeconds();

        console.log("[INFO] " + datetime + " chat request from " + data[0])
        rfrom = data[0].toString();
        rfrnd = data[1].toString();

        if (chats[rfrom] != undefined) {
          console.log(chats[rfrom])
          for (var i = 0; i < chats[rfrom].length; i++) {
            var array = Object.keys(chats[rfrom][i])

            if (array.indexOf(rfrnd) > -1) {
              chat = chats[rfrom][i][rfrnd];
              v = chats[rfrom][i]["from"];
              io.sockets.connected[socket.id].emit('chat-list', [chat, v, chats]);
            }
          }
        } else {
          io.sockets.connected[socket.id].emit('chat-list', [[], [], []]);
        }
      });

      socket.on('send-friend-request', function (friendRequestData) {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
          + (currentdate.getMonth() + 1) + "/"
          + currentdate.getFullYear() + " @ "
          + currentdate.getHours() + ":"
          + currentdate.getMinutes() + ":"
          + currentdate.getSeconds();

        console.log("[INFO] " + datetime + " friend request from " + friendRequestData[1] + " to " + friendRequestData[0]);

        registeredClients[friendRequestData[0]]["friendReq"].push(friendRequestData[1]);
        for (var i = 0; i < clients.length; i++) {
          if (clients[i]["name"] == friendRequestData[0]) {
            io.sockets.connected[clients[i]["id"]].emit('friendReq', friendRequestData[1]);
          }
        }
      });

      socket.on('chat message', function (data) { // list name, msg
        found = false;
        for (var i = 0; i < clients.length; i++) {
          if (data[2] == clients[i]["name"]) {
            io.sockets.connected[clients[i]["id"]].emit('chat message', data);
          }
        }

        // ************Salvataggio messaggio************
        sender = data[2];
        receiver = data[0];
        testarrkey = Object.keys(chats)
        boo = true

        if (testarrkey.indexOf(sender) < 0) { // Ricevente
          chats[sender] = [];
          chats[sender].push({});
          chats[sender][chats[sender].length - 1][receiver] = [];
          chats[sender][chats[sender].length - 1][receiver].push(data[1]);
          chats[sender][chats[sender].length - 1]["from"] = [];
          chats[sender][chats[sender].length - 1]["from"].push(0);
        } else {
          for (var i = 0; i < chats[sender].length; i++) {
            var kk = Object.keys(chats[sender][i]);
            if (kk.indexOf(receiver) > -1) {
              // aggiungo il messaggio
              chats[sender][i][receiver].push(data[1]);
              chats[sender][i]["from"].push(0);
              boo = false;
            }
          }
          if (boo) {
            // creo la lista
            chats[sender].push({});
            chats[sender][chats[sender].length - 1][receiver] = [];
            chats[sender][chats[sender].length - 1][receiver].push(data[1]);
            chats[sender][chats[sender].length - 1]["from"] = [];
            chats[sender][chats[sender].length - 1]["from"].push(0);
          }
        }

        boo = true

        if (testarrkey.indexOf(receiver) < 0) { // Mittente
          chats[receiver] = []
          chats[receiver].push({})
          chats[receiver][chats[receiver].length - 1][sender] = [];
          chats[receiver][chats[receiver].length - 1][sender].push(data[1])
          chats[receiver][chats[receiver].length - 1]["from"] = [];
          chats[receiver][chats[receiver].length - 1]["from"].push(1)
        } else {
          for (var i = 0; i < chats[receiver].length; i++) {
            var kk = Object.keys(chats[receiver][i]);
            if (kk.indexOf(sender) > -1) {
              // aggiungo il messaggio
              chats[receiver][i][sender].push(data[1])
              chats[receiver][i]["from"].push(1)
              boo = false;
            }
          }
          if (boo) {
            // creo la lista
            chats[receiver].push({});
            chats[receiver][chats[receiver].length - 1][sender] = [];
            chats[receiver][chats[receiver].length - 1][sender].push(data[1])
            chats[receiver][chats[receiver].length - 1]["from"] = []
            chats[receiver][chats[receiver].length - 1]["from"].push(1)
          }
        }
        // *********************************************
      });
    } else {
      console.log("[ERROR] the name already exist: " + reqName[0])
      io.sockets.connected[clients[reqName[1]]["id"]].emit("login", [-1, "fail"]);
    }


  });

  socket.on('disconnect', function () {

    for (var i = 0; i < clients.length; i++) {
      if (clients[i]["id"] == socket.id) {
        var d = new Date();
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
          + (currentdate.getMonth() + 1) + "/"
          + currentdate.getFullYear() + " @ "
          + currentdate.getHours() + ":"
          + currentdate.getMinutes() + ":"
          + currentdate.getSeconds();
        console.log("[INFO] " + datetime + " user disconnected " + clients[i]["name"])
        clients.splice(i, 1);
      }
    }
    lastClient--;
    for (var i = 0; i < registeredClients; i++) {
      io.sockets.connected[clients[i]["id"]].emit('friend-logged', clients);
    }
  });
}
);

http.listen(port, function () {
  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  console.log("[INFO] " + datetime + " listening on *:" + port);
});

function checkClients(name, clients) {
  bool = true
  let arr = []
  for (var i = 0; i < clients.length; i++) {
    arr.push(clients[i]["name"])
  }

  if (arr.indexOf(name) > -1) {
    return false
  } else {
    return true
  }

}


// function filterOnlineClient(array, valore){
//   var input, filter, ul, li, a, i;
//   input = document.getElementById("frndSearchField");
//   filter = input.value.toUpperCase();
//   ul = document.getElementById("chatFriends");
//   li = ul.getElementsByClassName("friendSectionLi");

//   for (i = 0; i < li.length; i++) {

//       var val = li[i].innerText.split(" ")[0].toUpperCase()

//       if (val.includes(filter) && val!= "") {
//           li[i].style.display = "";
//       } else {
//           li[i].style.display = "none";
//       }
//   }
// }

function filterOnlineClient(valore, from) {
  var input, filter, ul, li, a, i;
  filter = valore.toUpperCase(); // TODO if valore != null
  var array = Object.keys(registeredClients);

  var match = []



  for (i = 0; i < array.length; i++) {
    var val = array[i].toUpperCase();

    if (val.includes(filter) && valore !== "" && from.toUpperCase() != val) {
      match.push(array[i]);
    }
  }
  return match;
}