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

		this.terrainInfo = this.add.text(0, gameOptions.height-110, "", {
			fontFamily: "Arial",
			fontSize: 64,
			color: '#00ff00',
		});

		this.addCar(500,500);
		this.input.on("pointerdown", this.accelerate, this);
		this.input.on("pointerup", this.decelerate, this);
		this.matter.world.on("collisionstart", this.gameOver, this);
	}

	gameOver(event, bodyA, bodyB){
		if((bodyA.label == "diamond" && bodyB.label == "ground") || (bodyA.label == "ground" && bodyB.label == "diamond")){
            this.scene.restart();
        }
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
				angle: angle,
				label: "ground"
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
			label: "ground",
		});

		graphic.lineStyle(16, 0x6b9b1e);
		graphic.fillStyle(0x654b35);
		graphic.beginPath();
		curve.draw(graphic, 64);
		graphic.lineTo(gameOptions.width, slopeCurvePoints[slopeCurvePoints.length-1]);
		graphic.strokePath();

		return lastHeight;
	}

	addCar(posX, posY){

		//BUILD THE MAIN CAR
		var chase = Phaser.Physics.Matter.Matter.Bodies.rectangle(posX, posY, 200, 20, {
			label: "car",
		});
		var rightBarrier = Phaser.Physics.Matter.Matter.Bodies.rectangle(posX+90, posY-35, 20, 50, {
			label: "car",
		})
		var leftBarrier = Phaser.Physics.Matter.Matter.Bodies.rectangle(posX-90, posY-35, 20, 50, {
			label: "car",
		});

		this.body = Phaser.Physics.Matter.Matter.Body.create({
			parts: [chase, rightBarrier, leftBarrier],
			friction: 1,
			restitution: 0
		});
		this.matter.world.add(this.body);

		//ADD DIAMOND
		this.diamond = this.matter.add.rectangle(posX, posY-45, 30, 30, {
			friction: 1,
			restitution: 0,
			label: "diamond",
		});

		this.frontWheel = this.matter.add.circle(posX+50, posY+50, 40, {
			friction: 1,
			restitution: 0,
		});

		this.rearWheel = this.matter.add.circle(posX-50, posY+50, 40, {
			friction: 1,
			restitution: 0
		});

		this.matter.add.constraint(this.body, this.frontWheel, 40, 0, {
			pointA: {
				x:35,
				y:40,
			}
		});
		this.matter.add.constraint(this.body, this.frontWheel, 40, 0, {
			pointA: {
				x: 70,
				y:40
			}
		});

		this.matter.add.constraint(this.body, this.rearWheel, 40, 0, {
			pointA: {
				x:-35,
				y:40,
			}
		});
		this.matter.add.constraint(this.body, this.rearWheel, 40, 0, {
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
		var zoom = 1 - Phaser.Math.Clamp(this.body.speed, 0, 1) / 25;

		this.cameras.main.zoomTo(zoom, 1000, "Linear", false);
		this.cameras.main.scrollX = this.body.position.x - gameOptions.width/4 + gameOptions.width*(1-this.cameras.main.zoom);
		this.cameras.main.scrollY = this.body.position.y - gameOptions.height/2.2;

		this.velocity += this.acceleration;
		this.velocity = Phaser.Math.Clamp(this.velocity, 0, gameOptions.maxVelocity);

		this.matter.body.setAngularVelocity(this.frontWheel, this.velocity);
		this.matter.body.setAngularVelocity(this.rearWheel, this.velocity);

		this.grounds.forEach(function(ground){
			if(this.cameras.main.scrollX > ground.x+1920){
				ground.x = this.lastWidth+1920;
				this.lastWidth = ground.x;
				this.lastHeight = this.drawGround(ground, this.lastHeight);
			}
		}.bind(this));

		this.terrainInfo.x = this.cameras.main.scrollX + 50;
        this.terrainInfo.setText("Distance: " + Math.floor(this.cameras.main.scrollX / 100));
	}

}