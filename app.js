var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT||3000);

var KhoiTest = require("./my_modules/KhoiTest.js");
var gameOJ = require("./my_modules/GameOJ.js");
var NanoTimer = require('nanotimer');
var mangUsersOnline = [];

var timerObject = new NanoTimer();

var y = new KhoiTest._Point(0,100);
var z = new KhoiTest._Point(500,100);
var move = 1;

timerObject.setInterval(Tick, '', '20m');

io.on("connection", function(socket){
  console.log("Co nguoi vua ket noi, socket id: " + socket.id);
  
  socket.on("client_gui_username", function(data){
    console.log("Co nguoi dang ki username la: " + data);
    if( mangUsersOnline.indexOf(data)>=0){
      socket.emit("server-send-dangki-thatbai", data);
    }else{
      mangUsersOnline.push(data);
      socket.Username = data;
      io.sockets.emit("server-send-dangki-thanhcong", {username:data+"heo", id:socket.id});
    }
  });

  socket.on("client_gui_message", function(data){
    io.sockets.emit("server_gui_message", {Username:socket.Username, msg:data});
  });

  socket.on("user-chocgheo-socketid-khac", function(data){
    io.to(data).emit("server_xuly_chocgheo", socket.Username);
  });

  socket.on("join-game", function(data){
    gameOJ.addPlayer(socket.id);
  });

  socket.on("move-tank", function(data){
    data.playerID = socket.id;
    gameOJ.movePlayer(data);
  });

  socket.on('disconnect', function() {
    gameOJ.removePlayer(socket.id);
  });
});

app.get("/", function(req, res){
  res.render("trangchu");
});

function Tick(){
  gameOJ.gameTick(io);
}
