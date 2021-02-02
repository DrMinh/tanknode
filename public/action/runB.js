function openFullscreen() {
	var elem = document.getElementById("demoCanvas");
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
}

function KhoiDong(){
	gameOJ.loadMC.nowload([0,1,2],function(){
		//Create Spitesheet
		gameOJ.CreateAnimation();
		//Chuyển sang trạng thái menu
		gameOJ.changeTT(2);
	},0);
}

$(document).ready(function() {
	//
	gameOJ.setval();
	//Nhấp để chơi
	var Nut= new createjs.Shape(new createjs.Graphics().s("#000000").rf(["#006eff","#ffffff"], [0, 1], 0, 0, 0, 0, 0, 50).drawCircle(0, 0,50,50));
	var TamGiac= new createjs.Shape(
		new createjs.Graphics().s("#000000").beginFill("#FFFFFF").mt(-15,-15).lt(25,0).lt(-15,15).cp()
	);
	var Con=new createjs.Container();
	Con.addChild(Nut,TamGiac);
	Con.x=250;Con.y=150;
	Con.cache(-51,-51,102,102);
	Con.on("mousedown",
		function(){
			gameOJ.stage.removeAllChildren();
			KhoiDong();
			//openFullscreen();
		}
	);
	gameOJ.stage.addChild(Con);
	gameOJ.stage.update();
	//
	//KhoiDong();
});