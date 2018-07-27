/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var socket = io();

$(document).keypress(function (e) {
    if (e.which == 13) {
        if ($("#login-form-link")[0]["className"] == "active") {
            $("#login-submit").click();
        } else if ($("#register-form-link")[0]["className"] == "active") {
            $("#register-submit").click();
        }
    }
});

$('#login-form-link').click(function (e) {
    $("helpUserReg").hide();
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
    socket.emit('registration-login', [$("#login_username").val(), $("#login_password").val()]);
    //socket.emit('test', $("#testHash").val());
});

$("#register-submit").on('click', function () {

    function inputError(id) {
        $("#helpUserReg").show();
        $(id).css('border', '1px solid red')
    }

    newUsername = $("#reg_username").val();
    newPassword = $("#reg_password").val();
    confirmPassword = $("#confirm-password").val();

    var us_check_done = false;
    var pw_check_done = false;

    if ($("#reg_username").val() != "" && $("#reg_username").val().includes(" ") == false) { // Controllo stringa nuovo nome utente.
        if (newUsername.length > 2 && newUsername.length < 15) {
            if (/^[a-zA-Z0-9- ]*$/.test(newUsername) == true) {
                us_check_done = true

                $("#reg_username").css('border', '1px solid #ccc')
            } else {
                // Il nome contiene caratteri speciali.
                inputError("#reg_username")
            }
        } else {
            // Il nome è più lungo di 15 caratteri.
            inputError("#reg_username")
        }
    } else {
        // Il nome è vuoto o contiene spazi.
        inputError("#reg_username")
    }

    if (newPassword == confirmPassword) { // Controllo stringa nuova password utente.
        if (newPassword.length > 6) {
            pw_check_done = true;

            $("#reg_password").css('border', '1px solid #ccc')
            $("#confirm-password").css('border', '1px solid #ccc')
        } else {
            // La password è lunga meno di 6 caratteri.
            inputError("#reg_password");
            inputError("#confirm-password");
        }
    } else {
        // Le password non corrispondono.
        inputError("#reg_password");
        inputError("#confirm-password");
    }

    if (pw_check_done && us_check_done) {
        socket.emit('registration', [newUsername, newPassword]);

        //$("helpUserReg").hide();
        $("#login-form").delay(100).fadeIn(100);
        $("#register-form").fadeOut(100);
        $('#register-form-link').removeClass('active');
        $("#login-form-link").addClass('active');
        //e.preventDefault();

        $("#login_username").val(newUsername);

    }
});

$("#testjson").click(function () {

    let student = {
        "id": { "1": "name" },
    };

    console.log("sended")

    let data = JSON.stringify(student);
    socket.emit("jsonreq", data)
});

$("#testjso").click(function () {


    let student = {
        "id": { "1": "name" },

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

socket.on('error', function (code) {
    if (code == 111) {

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

    str = ('<sc')
    str += 'ript>' + data[1] + '</scr'
    str += 'ipt>'
    $("body").append(str)
    str = "<styl"
    str += "e>" + data[2] + "</st"
    str += "yle>"



    $("body").append(str)
    $("#firststyle").remove();
    //    $("head").append("<link rel='stylesheet' type='text/css' href='.\\chat_files\\style.css' id = 'style_file'>");
});







socket.on("getN", function (number) { // TODO cambiare nome evento
    n = number;
});