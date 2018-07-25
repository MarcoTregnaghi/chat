var socket = io();

var foo= "foo"

// socket.emit("id-req", 1)
// socket.on("id-resp", function(data){console.log(data)});

$('#login-form-link').click(function (e) {
    $("#login-form").delay(100).fadeIn(100);
    $("#register-form").fadeOut(100);
    $('#register-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
});
$('#register-form-link').click(function (e) {
    $("#register-form").delay(100).fadeIn(100);
    $("#login-form").fadeOut(100);
    $('#login-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
});

$("#login-submit").on('click', function () {

    console.log("ok")
    socket.emit('registration-login', [$("#login_username").val(), n]);

    //socket.emit('test', $("#testHash").val());

});

$("#testjson").click(function () {

    let student = {
        "id": {"1": "name"},

    };

    console.log("sended")

    let data = JSON.stringify(student);
    socket.emit("jsonreq", data)
});

$("#testjso").click(function () {
   

    let student = {
        "id": {"1": "name"},

    };

    console.log("sended")

    let data = JSON.stringify(student);
    socket.emit("jsonreq", data)
});

$("#readjson").click(function () {
    socket.emit("read", 1)
    //socket.emit("jsonreq", 1);

    // let response = await fetch("test.json");
    // let parsed = await response.json();
    // console.log(parsed)
});

socket.on("jsonres", function (data) {
        console.log(data);
    });

socket.on('login', function (msg) {
    if (msg[0] == "done") {
        name = $("#login_username").val();
        socket.emit('done-login', "");

    } else {
        alert("name already present"); // TODO segnalare in modo diverso l'utente
    }
});

socket.on('html-page', function (data) {
    console.log("okk")
    $("body").html(data)
    $("#firststyle").remove();
    $("head").append("<link rel='stylesheet' type='text/css' href='style.css' id = 'style_file'>");
});





socket.on("getN", function (number) { // TODO cambiare nome evento
    n = number;
});