class playGame extends Phaser.Scene{

	constructor(){
		super("PlayGame");
	}

	create(){
		//Variables
		this.speed = 200;
		this.slopesPerSlice = 5;
		this.gameRunning = true;

		this.matter.world.setBounds(0,0,gameOptions.width, gameOptions.height);

		//Start drawing
		this.grounds = [];
		this.lastHeight = 0;
		for(var i=0; i<1; i++){
			let graphic = this.add.graphics();
			graphic.x = i*gameOptions.width;

			if(i == 0){
				this.lastHeight = (Math.random()*140)+600;
			}

			this.lastHeight = this.drawGround(graphic, this.lastHeight);
			this.matter.add.gameObject(graphic, {
				isStatic:true
			});
			this.grounds.push(graphic);
		}


		this.matter.add.circle(1000,100,100);
	}

	drawGround(graphic, startHeight){
		//Variables
		var curSlopeLength = 0;
		var previousEndPoint = 0;
		var slopeCurvePoints = [];
		var remainingSpace = gameOptions.width;
		var lastHeight = 0;

		for(var i=0; i<this.slopesPerSlice; i++){
			curSlopeLength = (Math.random() * 200)+100;
			remainingSpace -= curSlopeLength;

			if(i == 0){
				slopeCurvePoints.push(0);
				slopeCurvePoints.push(startHeight);
			} else {
				slopeCurvePoints.push(previousEndPoint+curSlopeLength);
				lastHeight = (Math.random()*140)+600;
				slopeCurvePoints.push(lastHeight);
			}

			previousEndPoint = previousEndPoint+curSlopeLength;
		}
		
		//Draw the graphics
		var curve = new Phaser.Curves.Spline(slopeCurvePoints);
		var simpleCurve = simplify(curve.getPoints(32), 1, true);

		for(var i=1; i<simpleCurve.length; i++){
			let line = new Phaser.Geom.Line(simpleCurve[i-1].x, simpleCurve[i-1].y, simpleCurve[i].x, simpleCurve[i].y);
			let distance = Phaser.Geom.Line.Length(line);
			let center = Phaser.Geom.Line.GetPoint(line, 0.5);
			let angle = Phaser.Geom.Line.Angle(line);
			this.matter.add.rectangle(center.x, center.y, distance, 10, {
				isStatic: true,
				angle: angle
			});
		}

		graphic.clear();
		graphic.fillStyle(0x654b35);
		graphic.beginPath();
		curve.draw(graphic, 64);
		graphic.lineTo(gameOptions.width, slopeCurvePoints[slopeCurvePoints.length-1]);
		graphic.lineTo(gameOptions.width, gameOptions.height);
		graphic.lineTo(0, gameOptions.height);
		graphic.closePath();
		graphic.fillPath();

		var centerx = (gameOptions.width - remainingSpace)+((gameOptions.width - remainingSpace)/2);
		var centery = slopeCurvePoints[slopeCurvePoints.length-1];
		this.matter.add.rectangle(centerx, centery, remainingSpace, 10, {
			isStatic: true,
		});

		graphic.lineStyle(16, 0x6b9b1e);
		graphic.fillStyle(0x654b35);
		graphic.beginPath();
		curve.draw(graphic, 64);
		graphic.lineTo(gameOptions.width, slopeCurvePoints[slopeCurvePoints.length-1]);
		graphic.strokePath();

		return lastHeight;
	}

	update(time, delta){
		// this.grounds.forEach(function(ground){
		// 	ground.x -= 3;
		// 	if(ground.x == -1920){
		// 		ground.x = 1920;
		// 		this.lastHeight = this.drawGround(ground, this.lastHeight);
		// 	}
		// }.bind(this));
	}

}