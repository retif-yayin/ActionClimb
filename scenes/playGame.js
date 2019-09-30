class playGame extends Phaser.Scene{

	constructor(){
		super("PlayGame");
	}

	create(){
		//Variables
		this.speed = 200;
		this.slopesPerSlice = 5;
		this.gameRunning = true;
		this.acceleration = 0;
		this.velocity = 0;

		//Start drawing
		this.grounds = [];
		this.lastHeight = 0;
		this.lastWidth = 0;

		for(var i=0; i<2; i++){
			let graphic = this.add.graphics();
			graphic.x = i*gameOptions.width;
			this.lastWidth = graphic.x;

			if(i == 0){
				this.lastHeight = (Math.random()*140)+600;
			}
			this.lastHeight = this.drawGround(graphic, this.lastHeight);
			this.matter.add.gameObject(graphic, {
				isStatic:true
			});
			this.grounds.push(graphic);
		}

		this.addCar();
		this.input.on("pointerdown", this.accelerate, this);
		this.input.on("pointerup", this.decelerate, this);
	}

	drawGround(graphic, startHeight){
		//Variables
		var curSlopeLength = 0;
		var previousEndPoint = 0;
		var slopeCurvePoints = [];
		var totalLength = gameOptions.width;
		var lastHeight = 0;

		for(var i=0; i<this.slopesPerSlice; i++){
			curSlopeLength = (Math.random() * 200)+100;

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
			this.matter.add.rectangle(graphic.x+center.x, center.y, distance, 10, {
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

		totalLength = curve.getBounds().width;
		var centerx = totalLength+((gameOptions.width - totalLength)/2);
		var centery = slopeCurvePoints[slopeCurvePoints.length-1];
		this.matter.add.rectangle(graphic.x+centerx, centery, gameOptions.width - totalLength, 10, {
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

	addCar(){
		this.body = this.matter.add.rectangle(gameOptions.width/8, 500, 200, 60, {
			friction: 1,
			restitution: 0
		});

		this.frontWheel = this.matter.add.polygon(gameOptions.width/8+50, 570, 8, 32, {
			friction: 1,
			restitution: 0,
		});

		this.rearWheel = this.matter.add.polygon(gameOptions.width/8-50, 570, 8, 32, {
			friction: 1,
			restitution: 0
		});

		this.matter.add.constraint(this.body, this.frontWheel, 30, 0, {
			pointA: {
				x:35,
				y:40,
			}
		});
		this.matter.add.constraint(this.body, this.frontWheel, 30, 0, {
			pointA: {
				x: 70,
				y:40
			}
		});

		this.matter.add.constraint(this.body, this.rearWheel, 30, 0, {
			pointA: {
				x:-35,
				y:40,
			}
		});
		this.matter.add.constraint(this.body, this.rearWheel, 30, 0, {
			pointA: {
				x: -70,
				y:40
			}
		});
	}

	accelerate(){
		this.acceleration = gameOptions.acceleration[0];
	}

	decelerate(){
		this.acceleration = gameOptions.acceleration[1];
	}	


	update(time, delta){
		this.cameras.main.scrollX = this.body.position.x - gameOptions.width/8;

		this.velocity += this.acceleration;
		this.velocity = Phaser.Math.Clamp(this.velocity, 0, gameOptions.maxVelocity);

		this.matter.body.setAngularVelocity(this.frontWheel, this.velocity);
		this.matter.body.setAngularVelocity(this.rearWheel, this.velocity);

		this.grounds.forEach(function(ground){
			if(this.cameras.main.scrollX > ground.x+1920){
				console.log("regenerate");
				ground.x = this.lastWidth+1920;
				this.lastWidth = ground.x;
				this.lastHeight = this.drawGround(ground, this.lastHeight);
			}
		}.bind(this));
	}

}