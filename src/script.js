/**
 * @author Marco Tregnaghi <tregnaghi.marco@gmail.com>
 * 
 */

var socket = io();
var n="asd"

socket.emit('html-init', 1);

socket.on('html-init-res', function(data){

    $("body").html(data[0])
    console.log(data)
    $("body").append("<style>" + data[2]+ " </style>")
    $("body").append("<script>" + data[1]+ " </script>")

});