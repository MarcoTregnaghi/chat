var app = require("express")();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var $ = require('jquery');
var port = 3000;
var lastClient = 0;
var clients = [];
var chats = [];


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
        for (var i = 0; i < clients.length; i++) {
          if (data[0] == clients[i]["name"]) {
            console.log(clients[i]["name"])
            for (var g = 0; g < chats.length; g++) {
              if (data[0] == chats[g]["name"]) {
                console.log("sended " + chats[g]["name"])
                io.sockets.connected[clients[g]["id"]].emit('chat-list', chats[g]["chats"][data[1]]);
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
        for (var i = 0; i < chats.length; i++) {
          if (data[0] == chats[i]["name"]) {
            chats[i]["name"] //TODO chat 

            found = true;
          }
        }
        if (!found) {
          var nm = data[0].toString();
          var ms = data[1].toString();
          var to = data[2].toString();
          chats.push({
            nm: [    // TODO Finire definizione struttura oggetto Chats     
            ]
          });
          a = data[1].toString();
          chats[chats.length-1][nm].push({to: [a]})
        
        }
        console.log();
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
