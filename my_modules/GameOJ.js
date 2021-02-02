var KhoiTest = require('./KhoiTest.js');
///
var gameOJ = null;
(function(){
    gameOJ = {
        playerList: [],
        playerMoveList: [],
        addCon: function(ten,lop){
            var se=this;
            se[ten]=lop;
        },
        KetThua: function(lopcha,lopcon){
            lopcon.prototype = Object.create(lopcha.prototype);
            lopcon.prototype.constructor=lopcon;
        },
        addPlayer: function(cid){
            var newplayer = new gameOJ.Player(100,100,cid);
            this.playerList.push(newplayer);
            console.log(gameOJ.playerList.length);
        },
        findPlayer: function(cid){
            return gameOJ.playerList.findIndex( (x) => {return x.playerID === cid} );
        },
        removePlayer: function(cid){
            var index = gameOJ.findPlayer(cid);
            if(index === -1) return;
            gameOJ.playerList.splice(index,1);
            console.log(gameOJ.playerList.length);
        },
        movePlayer: function(data){
            var moveCode = parseInt(data.moveCode);

            if( !Number(moveCode) || moveCode < -1 || moveCode > 7){
                moveCode = 0;
            }
            var angle = (moveCode-2)*45;
            var roadlength = 2;
            var index = gameOJ.findPlayer(data.playerID);
            if(moveCode > -1){
                gameOJ.playerList[index].saveMoveControl(roadlength,angle,moveCode);
            }
            else {
                gameOJ.playerList[index].resetMove();
            }
        },
        gameTick: function(io){
            var playerListUpdate = [];
            for(var i = 0; i < gameOJ.playerList.length ; i ++ ){
                var x = gameOJ.playerList[i];
                x.moveControl();
                playerListUpdate.push({x:x.tankPoint.x,y:x.tankPoint.y,playerID: x.playerID,moveCode: x.moveCode});
            }
            io.sockets.emit("move_tank", {listPlayer: playerListUpdate});
        }
    }
}());

//Player
(function(){
	/* Khởi tạo */
	function Player(cx,cy,cid){
		this.tankPoint = new KhoiTest._Point(cx,cy);
		this.gunAngle = 100;
		this.tankHP = 500;
		this.playerName = "chicken";
        this.tankStyle = "0";
        this.playerID = cid;
        this.moveTarget = {roadlength: null, angle: null};
        this.moveCode = -1;
		//Default position
		this.moveTo(cx,cy);
		this.moveTurret(this.gunAngle);
	}
	/*Các phương thức chung */
	var p=Player.prototype;
	//Di chuyển Player đến vị trí cx,cy
	p.moveTo=function(cx,cy){
		this.tankPoint.setV(cx,cy);
    }
    p.saveMoveControl=function(roadlength, angle, movecode){
        this.moveTarget.roadlength = roadlength;
        this.moveTarget.angle = angle;
        this.moveCode = movecode;
    }
    p.resetMove=function(){
        this.moveTarget.roadlength = null;
        this.moveTarget.angle = null;
        this.moveCode = -1;
    }
    p.moveControl=function(){
        if( this.moveTarget.roadlength !== null && this.moveTarget.angle !== null){
            var newP = this.tankPoint.moveT(this.moveTarget.roadlength, this.moveTarget.angle);
            this.moveTo(newP.x, newP.y);
        }
    }
	p.moveTurret=function(angle){
		this.gunAngle = angle;
	}
	/*Nạp vào KhoiTest */
	gameOJ.addCon("Player",Player);
}());

module.exports = gameOJ;