/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var express = require("express");
var app = require("express")();
var fs = require("fs");
const bcrypt = require('bcryptjs');
var http = require("http").Server(app);
var io = require('socket.io')(http);
var $ = require('jquery');
var port = 3000;
var lastClient = 0;
var clients = {}; //TODO cambiare in onlineclients
var chats = {};
var registeredClients = {};

passwords = [];

app.use(express.static(".\\src\\"));

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');
//   });
{
  //http.use('./',  app.static(__dirname + './'));

  // *************File da mandare al client al collegamento*************
  // app.get('/', function (req, res) {
  //   res.sendFile(__dirname + '/index.html');
  // });

  // app.post('/', function (req, res) {
  //   res.redirect(__dirname + '/login.html');
  // });

  // app.get('/script.js', function (req, res) {
  //   res.sendFile(__dirname + '/script.js');
  // });

  // app.get('/mainBG.png', function (req, res) {
  //   res.sendFile(__dirname + '/mainBG.png');
  // });

  // app.get('/login_style.css', function (req, res) {
  //   res.sendFile(__dirname + '/login_style.css');
  // });
}

// app.get('/style.css', function (req, res) {
//   res.sendFile(__dirname + '/style.css');
// });
// *******************************************************************

io.on('connection', function (socket) {
  socket.on("id-req", function () {
    io.sockets.connected[socket.id].emit("id-resp", socket.id);
  })

  {
    // socket.on("writejson", function () {
    //   console.log("ok");


    // });

    // socket.on("jsonreq", function (data) {
    //   fs.writeFileSync('test.json', data);

    //   console.log("im going to read something")

    //   var obj;
    //   fs.readFile('test.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     obj = JSON.parse(data);
    //     console.log(obj)
    //   });

    // })

    // socket.on("read", function(){
    //   var obj;
    //   fs.readFile('test.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     obj = JSON.parse(data);
    //     console.log(obj)
    //   });
    // })
  }

  socket.on('html-init', function () {
    ret = []
    fs.readFile(__dirname + '\\login_files\\login_index.html', 'utf8', (err, dataPage) => {
      if (err) throw err;
      ret.push(dataPage);

      fs.readFile(__dirname + '\\login_files\\login_script.js', 'utf8', (err, dataPage2) => {
        if (err) throw err;
        ret.push(dataPage2);

        fs.readFile(__dirname + '\\login_files\\login_style.css', 'utf8', (err, dataPage3) => {
          if (err) throw err;
          ret.push(dataPage3);

          io.sockets.connected[socket.id].emit('html-init-res', ret);

        });
      });

    });
    // fs.readFile(__dirname + '\\login_files\\login_script.js', 'utf8', (err, dataPage) => {
    //   if (err) throw err;
    //   ret["js"] = dataPage;

    // });



  });



  socket.on('done-login', function (data) {


    // app.get('login.html', function (req, res) {
    //   res.sendFile(__dirname + 'login.html');
    // });


    //   if(data == "go"){
    //     app.redirect("./login.html");
    //   }
    //   if(passwords.length){
    //     if(bcrypt.compareSync(data, passwords[0])) {
    //       console.log("match")
    //      } else {
    //       console.log("NO match")
    //      }  

    //     passwords.pop();
    //   }
    //   console.log(data);
    //   let hash = bcrypt.hashSync(data, 10);
    //   passwords.push(hash);
    //   console.log(passwords);
  });

  io.sockets.connected[socket.id].emit("getN", lastClient);
  lastClient++;

  console.log("[INFO] " + getTime() + " user connected");

  socket.on('frndRq-accepted', function (data) {
    console.log("[INFO] " + getTime() + " friend request accepted from " + data[1] + " to " + data[0]);

    // Modifico registeredC
    registeredClients[data[0]]["friendReq"]["inBox"].splice(registeredClients[data[0]]["friendReq"]["inBox"].indexOf(data[1]), 1);
    registeredClients[data[1]]["friendReq"]["inBox"].splice(registeredClients[data[1]]["friendReq"]["inBox"].indexOf(data[0]), 1);
    registeredClients[data[1]]["friends"].push(data[0]);
    registeredClients[data[0]]["friends"].push(data[1]);

    // Notifico
    if (clients[data[0]]) {
      io.sockets.connected[clients[data[0]]["id"]].emit('refresh-frnd&frndreq-bar', [
        registeredClients[data[0]]["friendReq"],
        registeredClients[data[0]]["friends"]
      ]);
    }

    if (clients[data[1]]) {
      io.sockets.connected[clients[data[1]]["id"]].emit('refresh-frnd&frndreq-bar', [
        registeredClients[data[1]]["friendReq"],
        registeredClients[data[1]]["friends"]
      ]);
    }
  });

  socket.on('frndRq-refused', function (data) {
    console.log("[INFO] " + getTime() + " friend request refused from " + data[1] + " to " + data[0]);

    // Modifico registeredC
    registeredClients[data[0]]["friendReq"]["inBox"].splice(registeredClients[data[0]]["friendReq"]["inBox"].indexOf(data[1]), 1);
    registeredClients[data[1]]["friendReq"]["inBox"].splice(registeredClients[data[1]]["friendReq"]["inBox"].indexOf(data[0]), 1);

    // Notifico se gli utenti sono online.
    if (clients[data[0]]) {

      io.sockets.connected[clients[data[0]]["id"]].emit('refresh-frnd&frndreq-bar', [

        registeredClients[data[0]]["friendReq"], //data[0]
        registeredClients[data[0]]["friends"]]); //data[1]

    }

    if (clients[data[1]]) {
      console.log("SENDING TO " + data[1] + registeredClients[data[1]]["friendReq"])

      io.sockets.connected[clients[data[1]]["id"]].emit('refresh-frnd&frndreq-bar', [
        registeredClients[data[1]]["friendReq"],
        registeredClients[data[0]]["friends"]
      ]);
    }
  });

  socket.on('remove-friend-request', function (data) {
    // Modifico registeredC
    registeredClients[data[1]]["friends"].splice(registeredClients[data[1]]["friends"].indexOf(data[0]), 1);
    registeredClients[data[0]]["friends"].splice(registeredClients[data[0]]["friends"].indexOf(data[1]), 1);

    // Notifico se gli utenti sono online.
    if (clients[data[0]]) {
      io.sockets.connected[clients[data[0]]["id"]].emit('refresh-frnd&frndreq-bar', [
        registeredClients[data[0]]["friendReq"],
        registeredClients[data[0]]["friends"]
      ]);
    }

    if (clients[data[1]]) {
      io.sockets.connected[clients[data[1]]["id"]].emit('refresh-frnd&frndreq-bar', [
        registeredClients[data[1]]["friendReq"],
        registeredClients[data[1]]["friends"]
      ]);
    }
  });

  socket.on('registration', function (data) {  // REGISTRATION
    newUsername = data[0];
    newPassword = data[1];

    if (!registeredClients[newUsername]) {
      registeredClients[newUsername] = { "friendReq": { "inBox": [], "sended": [] }, "id": socket.id, "friends": [], "password": null };

      let hash = bcrypt.hashSync(newPassword, 10);

      registeredClients[newUsername]["password"] = hash;


    }

    console.log("[INFO] " + getTime() + " user succefully registered: " + newUsername + " pw: " + newPassword);



  });

  socket.on('registration-login', function (reqName) {  // LOGIN
    if (registeredClients[reqName[0]] == undefined) {
      console.log("error, user not exists")

      //io.sockets.connected[socket.id].emit("error", 111); // messaggio mirato (id)

    } else {
      if (checkClients(reqName[0], clients)) {

        var compare = bcrypt.compareSync(reqName[1], registeredClients[newUsername]["password"]);
        console.log("RESULT: " + compare)
        if (compare) {
          newName = reqName[0];


          clients[reqName[0]] = { "id": socket.id };

          var ret = [];

          fs.readFile(__dirname + '\\chat_files\\chat_index.html', 'utf8', (err, dataPage) => {
            if (err) throw err;
            ret.push(dataPage)

            fs.readFile(__dirname + '\\chat_files\\chat_script.js', 'utf8', (err, dataPage2) => {
              if (err) throw err;

              ret.push(dataPage2)

              fs.readFile(__dirname + '\\chat_files\\style.css', 'utf8', (err, dataPage3) => {
                if (err) throw err;



                ret.push(dataPage3)
                io.sockets.connected[socket.id].emit('html-page', ret);
              });
            });
          });

          console.log("[INFO] " + getTime() + " account confirmed: " + reqName[0] + " obj: " + registeredClients[newName])

          io.sockets.connected[socket.id].emit("login", ["done", clients]); // messaggio mirato (id)

          socket.on('data-on-login-req', function (name) {
            let ret = [registeredClients[name]["friendReq"], registeredClients[name]["friends"], chats[name], registeredClients];
            io.sockets.connected[socket.id].emit('data-on-login-resp', ret);
          });

          socket.on('search request', function (data) {
            var ret = filterOnlineClient(data[0], data[1]);
            io.sockets.connected[socket.id].emit('search response', ret);
          });

          socket.on('chat-request', function (data) {
            console.log("[INFO] " + getTime() + " chat request from " + data[0])
            rfrom = data[0].toString();
            rfrnd = data[1].toString();

            if (chats[rfrom] != undefined) {
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
            console.log("[INFO] " + getTime() + " friend request from " + friendRequestData[1] + " to " + friendRequestData[0]);

            registeredClients[friendRequestData[0]]["friendReq"]["inBox"].push(friendRequestData[1]);
            registeredClients[friendRequestData[1]]["friendReq"]["sended"].push(friendRequestData[0]);

            if (clients[friendRequestData[0]]) {
              io.sockets.connected[clients[friendRequestData[0]]["id"]].emit('friendReq', friendRequestData[1]);
            }
          });

          socket.on('remove-friend-request', function (friendRequestData) {
            console.log("[INFO] " + getTime() + " remove friend request from " + friendRequestData[1] + " to " + friendRequestData[0]);

            if (clients[friendRequestData[0]] != undefined) {
              io.sockets.connected[clients[friendRequestData[0]]["id"]].emit('friend-removed', friendRequestData[1]);
            }

          });

          socket.on('chat message', function (data) {
            if (clients[data[2]] != undefined) {
              io.sockets.connected[clients[data[2]]["id"]].emit('chat message', data);
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
        }

      } else {
        console.log("[INFO] another host is logged in with this account: " + reqName[0])

        io.sockets.connected[socket.id].emit("login", [-1, "fail"]);
      }
    }
  });


  socket.on('sign-out', function () {
    var arr = Object.keys(clients);

    Object.keys(clients).forEach(function (name) {
      if (clients[name]["id"] == socket.id) {
        console.log("[INFO] " + getTime() + " user disconnected " + name);
        delete clients[name];
      }
    });

    lastClient--;
  });

  socket.on('disconnect', function () {
    var arr = Object.keys(clients);

    Object.keys(clients).forEach(function (name) {
      if (clients[name]["id"] == socket.id) {
        console.log("[INFO] " + getTime() + " user disconnected " + name);
        delete clients[name];
      }
    });

    lastClient--;
  });
});


http.listen(port, function () {
  console.log("[INFO] " + getTime() + " listening on *:" + port);
});

function checkClients(name, clients) {
  bool = true
  let arr = Object.keys(clients);

  if (arr.indexOf(name) > -1) {
    return false
  } else {
    return true
  }
}

function checkNewNameIfExists(name, clients) {
  bool = true
  let arr = Object.keys(registeredClients);

  if (arr.indexOf(name) > -1) {
    return false
  } else {
    return true
  }
}

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

function getTime() {
  var currentdate = new Date();
  var datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  return datetime;
}

class Client {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.chat = {};
  }
}