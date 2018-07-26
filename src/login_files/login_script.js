/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var socket = io();

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
    socket.emit('registration-login', [$("#login_username").val(), $("#login_password").val()]);

    //socket.emit('test', $("#testHash").val());

});

$("#register-submit").on('click', function () {

    console.log("ok")
    newUsername = $("#reg_username").val();
    newPassword = $("#reg_password").val();
    

    socket.emit('registration', [newUsername, newPassword]);



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

socket.on('error', function(code){
    if(code == 111){

        $("#register-submit").css('background-color', 'red');

    }
})

socket.on("jsonres", function (data) {
    
    });
var name;
socket.on('login', function (msg) {
    if (msg[0] == "done") {
        name = $("#login_username").val();
        socket.emit('done-login', "");

    } else {
        alert("name already present"); // TODO segnalare in modo diverso l'utente
    }
});

socket.on('html-page', function (data) {
    $("body").html(data[0])

    str=('<sc')
    str+= 'ript>'+data[1]+'</scr'
    str+='ipt>'
    $("body").append(str)
    str = "<styl"
    str+="e>" + data[2] + "</st"
    str+="yle>"



    $("body").append(str)
    $("#firststyle").remove();
//    $("head").append("<link rel='stylesheet' type='text/css' href='.\\chat_files\\style.css' id = 'style_file'>");
});







socket.on("getN", function (number) { // TODO cambiare nome evento
    n = number;
});