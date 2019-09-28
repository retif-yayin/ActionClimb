class bootGame extends Phaser.Scene{

	constructor(){
		super("BootGame");
	}

	preload(){

	}

	create(){
		this.scene.start("PlayGame");
	}

}