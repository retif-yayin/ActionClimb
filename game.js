var game;

var gameOptions = {
	width:1920,
	height:1080,
};

window.onload = function(){
	game = new Phaser.Game({
		width: gameOptions.width,
		height: gameOptions.height,
		backgroundColor: 0x75d5e3,
		scene: [bootGame, playGame],
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
		physics: {
			default: "matter",
			arcade:{
				gravity: {
					x: 0,
					y: 0,
				},
				debug: true,
			}
		}
	});

	window.focus();
}