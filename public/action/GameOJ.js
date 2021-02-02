/* GameOJ quản lý trò chơi */
//Khai báo
var gameOJ={
	stage: null, // Màn chính
	stage1: null, // Màn menu
	stage2: null, // Màn chơi
	loadMC: null,
	asset: null,
	Socket: null,
	gameW: 0,
	gameH: 0,
	gameSW: 0,
	gameSH: 0,
	gameTT: 0, //Trạng thái game: 0-loading 1-Menu 2-Chọn bảng đồ 3-Đang chơi
	gameNN: 0, //Số đếm trò chơi
	Sound: [],
	playerList: [],
	playerExistList: [], //Danh sách người chơi còn tồn tại
	player: null,
	SpriteSheetList: [],
	playerControl: null,
	addCon: function(ten,lop){
		var se=this;
		se[ten]=lop;
	},
	KetThua: function(lopcha,lopcon){
		lopcon.prototype = Object.create(lopcha.prototype);
		lopcon.prototype.constructor=lopcon;
	},
	setval: function(){
		// Socket
		gameOJ.Socket = io("//tanknode.herokuapp.com/");
		gameOJ.Socket.on("move_tank", function(data){
			gameOJ.updateData(data);
		});
		//Màn hình
		gameOJ.gameH=300;
		gameOJ.gameW=500;
		gameOJ.gameSH=1;
		gameOJ.gameSW=1;
		//
		//stage
		gameOJ.stage=new  createjs.StageGL("demoCanvas"); //,{preserveBuffer: true}
		gameOJ.stage1=new createjs.Container();
		gameOJ.stage2=new createjs.Container();
		gameOJ.stage.addChild(gameOJ.stage1,gameOJ.stage2);
		//List tải
		gameOJ.asset=[
			{src:"./asset/bullet.png", id:"bullet"},
			{src:"./asset/tankBase.png", id:"tankBase"},
			{src:"./asset/tankTurret.png", id:"tankTurret"}
		];
		//biến tải
		gameOJ.loadMC=new LoadMi(gameOJ);
		//Tick eventdw
		createjs.Ticker.addEventListener("tick", gameOJ.tick);
		//createjs.Ticker.timingMode=createjs.Ticker.RAF_SYNCHED;
		createjs.Ticker.timingMode=createjs.Ticker.RAF;
		//createjs.Ticker.timingMode=createjs.Ticker.TIMEOUT
		//createjs.Ticker.framerate = 10;
		gameOJ.stage.enableMouseOver(20);
		gameOJ.stage.mouseEnabled = true;
		createjs.Touch.enable(gameOJ.stage);
		gameOJ.stage.snapToPixelEnabled=true;
		//Tải nhạc
		//this.AddSound();
		//
		//Ngăn ảnh bị nhòe
		// var canvas = document.getElementById('demoCanvas');
		// var ctx = canvas.getContext('2d');
		// ctx.imageSmoothingEnabled = false;
		gameOJ.FixCanvas();
	},
	AddSound: function(){
		// this.Sound[0] = new Howl({
		// 	src: ['AmThanh/mc4.wav'],
		// 	autoplay: false,
		// 	loop: false,
		// 	volume: 0.2,
		// 	onend: function() {
		// 	//   console.log('Finished!');
		// 	}
		// });
	},
	CreateAnimation: function(){
		// Base
		var dataTankBase = {
			images: [gameOJ.loadMC.getAsset("tankBase")],
			frames: {width:32, height:32},
			animations: {
				tank1: 0,
			}
		};
		this.SpriteSheetList["TankBase"]=new createjs.SpriteSheet(dataTankBase);
		//Turret
		var dataTankTurret = {
			images: [gameOJ.loadMC.getAsset("tankTurret")],
			frames: {width:32, height:32},
			animations: {
				tank1: 0,
			}
		};
		this.SpriteSheetList["TankTurret"]=new createjs.SpriteSheet(dataTankTurret);
	},
	FixCanvas: function(){
		gameOJ.stage.canvas.width=window.innerWidth;
		gameOJ.stage.canvas.height=window.innerHeight;
		gameOJ.gameSH=gameOJ.stage.canvas.height/gameOJ.gameH;
		gameOJ.gameSW=gameOJ.stage.canvas.width/gameOJ.gameW;
		gameOJ.stage.scaleX=gameOJ.gameSW;gameOJ.stage.scaleY=gameOJ.gameSH;
		gameOJ.stage.updateViewport(gameOJ.stage.canvas.width,gameOJ.stage.canvas.height);
	},
	Fitcon: function(){
		var newcon=new createjs.Container();
		newcon.scaleX=gameOJ.gameSW;
		newcon.scaleY=gameOJ.gameSH;
		return newcon;
	},
	clearCanvas: function(){
		gameOJ.stage.removeAllChildren();
		gameOJ.stage1.removeAllChildren();
		gameOJ.stage2.removeAllChildren();
		// Tạo lớp chứa
		var tankCon = new createjs.Container();
		gameOJ.stage2.addChild(tankCon);
		// Add vào stage gốc
		gameOJ.stage.addChild(gameOJ.stage1,gameOJ.stage2);
	},
	changeTT: function(num){
		gameOJ.gameTT=num;
		gameOJ.gameNN=0;
		//Clear
		gameOJ.clearCanvas();
	},
	findPlayer: function(cid){
		return gameOJ.playerList.findIndex( (x) => {return x.playerID === cid} );
	},
	addPlayer: function(cx,cy,cid){
		var newPlayer = new gameOJ.Player(cx,cy,cid);
		gameOJ.playerList.push(newPlayer);
		gameOJ.stage2.getChildAt(0).addChild(newPlayer.tankGraphic);
	},
	removePlayer: function(cid){
		var index = gameOJ.findPlayer(cid);
		gameOJ.stage2.getChildAt(0).removeChild(gameOJ.playerList[index].tankGraphic);
		gameOJ.playerList.splice(index,1);
	},
	//Tick
	tick: function(){
		if(gameOJ.gameTT==1)
			gameOJ.tickMenu();
		else if(gameOJ.gameTT==2)
			gameOJ.tickPlay();
		gameOJ.gameNN ++ ;
		gameOJ.stage.update();
	},
	tickMenu: function(){
		
	},
	tickPlay: function(){
		if(gameOJ.gameNN === 0){
			//Born player
			gameOJ.joinGame();
			gameOJ.createControl();
			//
			gameOJ.gameNN ++;
		} else if(gameOJ.playerList.length > 0){
			for(var i = 0; i < gameOJ.playerList.length ; i++ ){
				if(Boolean(gameOJ.playerExistList[i]) ){
					gameOJ.playerList[i].Tick();
				}
				else {
					gameOJ.removePlayer(gameOJ.playerList[i].playerID);
				}
			}
			// event
			gameOJ.playerControl.mouseMoveEvent(gameOJ.stage.mouseX,gameOJ.stage.mouseY); 
		}
	},
	/* Socket event */
	updateData: function(data){
		if(gameOJ.gameTT === 2){
			// Reset Exist list
			gameOJ.playerExistList = [];

			for(var i = 0; i < data.listPlayer.length ; i++){
				var update_player = data.listPlayer[i];
				var playerIndex = gameOJ.findPlayer(update_player.playerID);
				if(playerIndex === -1){
					gameOJ.addPlayer(update_player.x,update_player.y,update_player.playerID);
					gameOJ.playerExistList[gameOJ.playerList.length-1] = true;
					playerIndex = gameOJ.playerList.length-1;
				}
				else {
					gameOJ.playerList[playerIndex].moveTo(update_player.x,update_player.y);
					gameOJ.playerList[playerIndex].updateHistoryMove(data.listPlayer[i].moveCode);
					gameOJ.playerExistList[playerIndex] = true;
				}
				// Get user player
				if(
					gameOJ.player === null
					&& Boolean(gameOJ.Socket.id)
					&& gameOJ.playerList[playerIndex].playerID === gameOJ.Socket.id)
				{
					gameOJ.player = gameOJ.playerList[playerIndex];
				}
			}
		}
	},
	joinGame: function(){
		gameOJ.Socket.emit("join-game", "ok");
	},
	movePlayer: function(moveCode){
		if(gameOJ.player === null) return;
		// move code: 0-U 1-UR 2-R 3-DR 4-D 5-DL 6-L 7-UL
		gameOJ.Socket.emit("move-tank",{moveCode: moveCode});
		gameOJ.player.updateHistoryMove(moveCode);
	},
	createControl: function(){
		gameOJ.playerControl = new gameOJ.GameControl();
	},
};

/* Các đối tượng của game */
//Player
(function(){
	/* Khởi tạo */
	function Player(cx,cy,cid){
		this.tankPoint = new KhoiTest._Point(cx,cy);
		this.gunAngle = 0;
		this.tankHP = 500;
		this.playerName = "chicken";
		this.tankStyle = "0";
		this.playerID = cid;
		// chỉnh sai số
		this.targetMove = {
			baseRotaion: null,
		};
		//Đồ họa
		this.tankBaseSprite = new createjs.Sprite(gameOJ.SpriteSheetList["TankBase"], "tank"+this.tankStyle);
		this.tankTurretSprite = new createjs.Sprite(gameOJ.SpriteSheetList["TankTurret"], "tank"+this.tankStyle);
		this.tankGraphic = new createjs.Container(); //Tạo container chứa đồ họa
		this.tankGraphic.addChild(this.tankBaseSprite, this.tankTurretSprite); // Add
		this.tankBaseSprite.regX=this.tankBaseSprite.regY=16; // Điểm neo ở giữa ảnh 32x32
		this.tankTurretSprite.regX=this.tankTurretSprite.regY=16; // ...
		//Default position
		this.moveTo(cx,cy);
		this.moveTurret(this.gunAngle);
	}
	/*Các phương thức chung */
	var p=Player.prototype;
	//Di chuyển Player đến vị trí cx,cy
	p.moveTo=function(cx,cy){
		this.tankPoint.setV(cx,cy);
		this.tankGraphic.x = cx;
		this.tankGraphic.y = cy;
	}
	p.moveTurret=function(angle){
		this.gunAngle = angle;
		this.tankTurretSprite.rotation = angle;
	}
	p.updateHistoryMove=function(moveCode){
		if(moveCode === -1 || this.tankBaseSprite.rotation === moveCode*45) {
			this.targetMove.baseRotaion = null;
			return;
		}
		//
		var value = moveCode*45;
		var stepValue = 5;
		var currentValue = this.tankBaseSprite.rotation;
		if(currentValue < 180){
			var bigValue = currentValue + 180;
			var smallValue =currentValue;
			var arrow = 1;
		} else {
			var bigValue = currentValue;
			var smallValue =currentValue - 180;
			var arrow = -1;
		}
		if(value >= smallValue && value < bigValue){
			stepValue = stepValue*arrow
		}
		else {
			stepValue = -stepValue*arrow;
		}
		// Save to rotate later
		this.targetMove.baseRotaion = {value: value, stepValue: stepValue };
		console.log("befor",this.tankBaseSprite.rotation,this.targetMove.baseRotaion);
	}
	p.Tick=function(){
		if(this.targetMove.baseRotaion !== null){

			this.tankBaseSprite.rotation += this.targetMove.baseRotaion.stepValue;

			if(this.tankBaseSprite.rotation < 0){
				this.tankBaseSprite.rotation = 360 + this.tankBaseSprite.rotation;
			} else if( this.tankBaseSprite.rotation >= 360 ) {
				this.tankBaseSprite.rotation = this.tankBaseSprite.rotation % 360;
			}

			if( Math.abs(this.tankBaseSprite.rotation + this.targetMove.baseRotaion.stepValue - this.targetMove.baseRotaion.value) < Math.abs(this.targetMove.baseRotaion.stepValue)){
				this.tankBaseSprite.rotation = this.targetMove.baseRotaion.value;
				this.targetMove.baseRotaion = null;
			} else if(this.tankBaseSprite.rotation === this.targetMove.baseRotaion.value){
				this.targetMove.baseRotaion = null;
			}
		}
	}
	/*Nạp vào gameOJ */
	gameOJ.addCon("Player",Player);
}());

// Control object
(function(){
	/* Khởi tạo */
	function GameControl(){
		// Build map moveCode
		this.moveMap = [];
		this.moveMap['KeyDKeyW'] = this.moveMap['KeyWKeyD'] = 1;
		this.moveMap['KeyDKeyS'] = this.moveMap['KeySKeyD'] = 3;
		this.moveMap['KeyAKeyS'] = this.moveMap['KeySKeyA'] = 5;
		this.moveMap['KeyAKeyW'] = this.moveMap['KeyWKeyA'] = 7;
		this.moveMap['KeyW'] = 0;
		this.moveMap['KeyD'] = 2;
		this.moveMap['KeyS'] = 4;
		this.moveMap['KeyA'] = 6;
		// Build move stack
		this.moveStack = [];
		// Build key event
		this.buildKeyEvent();
	}
	/*Các phương thức chung */
	var p=GameControl.prototype;
	// Tạo sự kiện bàn phím
	p.buildKeyEvent=function(){
		var se = this;
		// Key Event
		document.onkeydown = function(e){
			if (!e) {
				var e = window.event;
			}
			if(gameOJ.gameTT === 2){
				if (e.code === 'KeyS' || e.code === 'KeyD' || e.code === 'KeyA' || e.code === 'KeyW'){
					if(se.moveStack.indexOf(e.code) !== -1) return; // Fix auto repeat
					se.moveStack.push(e.code);
					gameOJ.movePlayer(se.buildMoveCode());
				}
			}
		}
		document.onkeyup = function(e){
			if(gameOJ.gameTT === 2){
				if (e.code === 'KeyS' || e.code === 'KeyD' || e.code === 'KeyA' || e.code === 'KeyW'){
					var removeCode = se.moveStack.indexOf(e.code);
					se.moveStack.splice(removeCode,1);
					gameOJ.movePlayer(se.buildMoveCode());
				}
			}
		}
	}
	p.mouseMoveEvent = function(mouseX,mouseY){
		if(gameOJ.player === null || gameOJ.gameNN % 1 !== 0 ) return;
		var mousePoint = new KhoiTest._Point(mouseX/gameOJ.gameSW,mouseY/gameOJ.gameSH);
		var angle = gameOJ.player.tankPoint.angleP(mousePoint) +90.0;
		gameOJ.player.moveTurret(angle);
	}
	p.buildMoveCode = function(){
		if(this.moveStack.length === 1){
			return this.moveMap[this.moveStack[0]];
		}
		else if(this.moveStack.length > 1){
			var l = this.moveStack.length;
			var moveMerg = this.moveMap[this.moveStack[l-1]+this.moveStack[l-2]];
			return Boolean(moveMerg)? moveMerg:this.moveMap[this.moveStack[l-1]];
		}
		return -1;
	}

	/*Nạp vào gameOJ */
	gameOJ.addCon("GameControl",GameControl);
}());