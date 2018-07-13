var app = require("express")();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var $ = require('jquery');
var port = 3000;
var lastClient = 0;
var clients = [];
var chats = {};


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function (req, res) {
  res.sendFile(__dirname + '/script.js');
});

io.on('connection', function (socket) {
  io.sockets.connected[socket.id].emit("getN", lastClient);
  lastClient++;
  clients.push({ "id": socket.id, "name": "" })

  console.log('[INFO] user connected');

  socket.on('registration', function (reqName) {
    if (checkClients(reqName[0], clients)) {
      clients[reqName[1]]["name"] = reqName[0];
      console.log("[INFO] account confirmed: " + reqName[0])

      io.sockets.connected[clients[reqName[1]]["id"]].emit("login", ["done", clients]); // messaggio mirato (id)

      for (var i = 0; i < clients.length; i++) {
        io.sockets.connected[clients[i]["id"]].emit('user logged', clients);
      }
      socket.on('chat-request', function (data) {
        console.log("chat request")
        rfrom = data[0];
        rfrnd = data[1];
        if (data[rfrom] != undefined) {
          if (data[rfrom].indexOf(Object.keys(chats)) < 0) {
            for (var i = 0; i < clients.length; i++) {
              if (data[rfrom] == clients[i]["name"]) {
                console.log("ok")
                chat = chats[rfrom][rfrnd];
                v = chats[rfrom]["from"];
                io.sockets.connected[clients[i]["id"]].emit('chat-list', [chat, v]);
              }
            }
          }
        }

      });
      socket.on('chat message', function (data) { // list name, msg
        found = false;
        for (var i = 0; i < clients.length; i++) {
          if (data[2] == clients[i]["name"]) {
            console.log("ok")
            io.sockets.connected[clients[i]["id"]].emit('chat message', data);
          }
        }
        sender = data[0];
        if (data[2].indexOf(Object.keys(chats)) < 0) { // Ricevente
          chats[data[2]] = { sender: [], "from": [] };
          console.log(chats[data[2]])
          //chats[data[2]][sender].push(data[1]);
          chats[data[2]]["from"].push(0);
        } else {
          chats[data[2]][sender].push(data[1]);
          chats[data[2]]["from"].push(0);
        }
        sender = data[2];
        if (data[0].indexOf(Object.keys(chats)) < 0) { // Mittente

          chats[data[0]] = { sender: [], "from": [] }
          //chats[data[0]][sender].push(data[1]);
          chats[data[0]]["from"].push(1);
        } else {
          chats[data[0]][sender].push(data[1]);
          chats[data[0]]["from"].push(1);
        }


      });
    } else {

      console.log("[ERROR] the name already exist: " + reqName[0])
      io.sockets.connected[clients[reqName[1]]["id"]].emit("login", [-1, "fail"]);
    }


  });

  socket.on('disconnect', function () {
    console.log("[INFO] user disconnected")
    for (var i = 0; i < clients.length; i++) {
      if (clients[i]["id"] == socket.id) {
        clients.splice(i, 1);
      }
    }
    lastClient--;

    for (var i = 0; i < clients.length; i++) {
      io.sockets.connected[clients[i]["id"]].emit('user logged', clients);

    }
  });
}
);

http.listen(port, function () {
  console.log('[INFO] listening on *:' + port);
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
