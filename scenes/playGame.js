class playGame extends Phaser.Scene{

	constructor(){
		super("PlayGame");
	}

	create(){
		//Variables
		this.speed = 200;
		this.slopesPerSlice = 5;

		//Start drawing
		this.grounds = [];
		for(var i=0; i<2; i++){
			let graphic = this.add.graphics();
			graphic.x = i*gameOptions.width;
			this.drawGround(graphic);
			this.grounds.push(graphic);
		}
	}

	drawGround(graphic){
		//Variables
		var curSlopeLength = 0;
		var previousEndPoint = 0;
		var slopeCurvePoints = [];
		var remainingSpace = gameOptions.width;

		for(var i=0; i<this.slopesPerSlice; i++){
			curSlopeLength = (Math.random() * 200)+100;
			remainingSpace -= curSlopeLength;

			if(i == 0){
				slopeCurvePoints.push(0);
			} else {
				slopeCurvePoints.push(previousEndPoint+curSlopeLength);
			}

			slopeCurvePoints.push((Math.random()*140)+600);
			previousEndPoint = previousEndPoint+curSlopeLength;
		}
		
		//Draw the graphics
		var curve = new Phaser.Curves.Spline(slopeCurvePoints);

		graphic.clear();
		graphic.fillStyle(0x654b35);
		graphic.beginPath();
		curve.draw(graphic, 64);
		graphic.lineTo(gameOptions.width, slopeCurvePoints[slopeCurvePoints.length-1]);
		graphic.lineTo(gameOptions.width, gameOptions.height);
		graphic.lineTo(0, gameOptions.height);
		graphic.closePath();
		graphic.fillPath();

		graphic.lineStyle(16, 0x6b9b1e);
		graphic.fillStyle(0x654b35);
		graphic.beginPath();
		curve.draw(graphic, 64);
		graphic.lineTo(gameOptions.width, slopeCurvePoints[slopeCurvePoints.length-1]);
		graphic.strokePath();

		return true;
	}

	update(time, delta){
		var offset = delta / 1000*this.speed;
		this.grounds.forEach(function(ground){
			ground.x -= offset;
		});
	}

}