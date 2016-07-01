
console.log("@");
var express = require('express');
var app = express();
var port = 8111;
app.use(express.static(__dirname + '/public'));
var server = require('http').createServer(app);

server.listen(port);
console.log("@ listening on port" + port);