function PlayVm() {
    this.basicObjects = [];
    this.playField;
    this.player;
    this.collisioner;
    this.otherPlayer;
    this.balls;
    this.period = 33;
    this.isGameStarted = false

    this.getMousePos = function(canvasDom, mouseEvent) {
      var rect = canvasDom.getBoundingClientRect();
      return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
      };
    }

    this.onCreate = function() {
        var self = this;
        SocketManager.clearListeners();
        SocketManager.registerListener(new MultiplayManager(this));

        this.winner = false;
        this.canvas = document.getElementById("myCanvas");
        this.isStartingGame = false;
        this.isGameStarted = false;

        this.canvas.addEventListener("mouseup", function (e) {
            if(self.winner !== false) {
                self.onPause()
                self.onCreate();
                self.onResume();
            }
        }, false);

        this.canvas.addEventListener("mousemove", function (e) {
            if(self.winner === false) {
                var mousePos = self.getMousePos(self.canvas, e);
                self.playField.onTouchEvent(mousePos.x, mousePos.y);
            }
        }, false);

        this.playField = new PlayField();
        this.playField.setPlayController(this);
        this.player = new BullDozer(BullDozer.LOCAL_PLAYER);
        this.otherPlayer = new BullDozer(BullDozer.REMOTE_PLAYER);

        this.otherPlayer.basicObject.getBasicObjectDrawer().setColor("#00f");
        this.collisioner = new Collisioner(this);

        this.player.basicObject.getPosition().set(0, 0);
        this.otherPlayer.basicObject.getPosition().set(0, 0);

        this.basicObjects.push(this.player);
        this.basicObjects.push(this.otherPlayer);
        this.balls = [];

        this.balls.push(new Ball(1, 20, 50));
        this.balls.push(new Ball(2, 40, 50));
        this.balls.push(new Ball(3, 50, 50));
        this.balls.push(new Ball(4, 60, 50));
        this.balls.push(new Ball(5, 80, 50));
        this.basicObjects = this.basicObjects.concat(this.balls);
    }

    this.onResume = function() {
        var self = this;
        self.interval = setInterval(function(){
            self.onTimerTick();
        }, self.period);
    }

    this.onPause = function() {
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    this.onDraw = function(canvas){
        var ctx = canvas.getContext("2d");
        var point = new Point(50, 50);
        var absPosition = PlayField.getAbsolutePosition(point);
        ctx.font = "30px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        if(this.isStartingGame) {
            ctx.fillText("Starting Game...", canvas.width/2, canvas.height/2);
        }
        if(this.winner !== false) {
            var msg = "You lost!";
            if(SocketManager.getRoom().getPlayerNumber() == this.winner){
                msg = "You won!";
                ctx.fillStyle = "green";
            }
            ctx.fillText(msg, canvas.width/2, canvas.height/2);
        }
    }

    this.startingGame = function() {
        console.log("...Game starting...");
        this.winner = false;
        this.isStartingGame = true;
    }

    this.startGame = function() {
        console.log("Game started!!");
        this.winner = false;
        this.isGameStarted = true;
        this.isStartingGame = false;
    }

    this.ticks = 0;
    this.tickMax = 10000;
    this.onTimerTick = function() {
        this.ticks++;
        if(this.ticks > this.tickMax){
            this.ticks = 0;
        }
        if (SocketManager.isConnected) {

            this.playField.onDraw(this.canvas, this.canvas.width, this.canvas.height);
            for (var i=0; i<this.basicObjects.length; i++) {
                this.basicObjects[i].basicObject.update();
            }

            if(this.gameIsStarted()) {

                if(this.winner === false) {
                    this.collisioner.update();
                    this.winner = this.checkWin();
                    this.ticks = 0;
                }
                if(this.winner !== false && this.ticks % 10 == 0){
                    for (var i=0; i<this.basicObjects.length; i++) {
                        this.basicObjects[i].basicObject.setTarget(new Target(
                                Math.random()*100 + Math.sin(this.ticks/this.tickMax)*50,
                                Math.random()*100 + Math.sin(this.ticks/this.tickMax)*50));
                        this.basicObjects[i].basicObject.speed = 3;
                        this.basicObjects[i].basicObject.drag = 0;
                    }
                }
                if(SocketManager.getRoom() && this.winner === false) {
                    SocketManager.getInstance().sendPositionAndVector(this.player.basicObject.getPosition(), this.player.basicObject.getVector());
                    if (SocketManager.getRoom().getPlayerNumber() == 0) {
                        for (var i=0; i<this.balls.length; i++) {
                            SocketManager.getInstance().sendBallPosition(this.balls[i]);
                        }
                    }
                }
            }
        }
        this.onDraw(this.canvas);

    }

    this.checkWin = function(){
        var winner = false;
        var bos = this.basicObjects;

        for (var i = 0; i < bos.length; i++) {
            if(bos[i] instanceof Ball) {
                var ball = bos[i];
                if(!winner && ball.isOwned()) {
                    winner = ball.getOwner();
                } else if(winner != ball.getOwner()){
                    return false;
                }
            }
        }
        return winner;
    };

    this.getAll = function() {
        return this.basicObjects;
    }

    this.onTargetSelected = function(target) {
        //console.log(target);
        this.player.basicObject.setTarget(target);
    }

    this.onJoinedRoom = function() {
        var playerNumber = SocketManager.getRoom().getPlayerNumber();
        if (playerNumber == 0) {
            this.player.basicObject.setPosition(new Point(50, 80));
            this.otherPlayer.basicObject.setPosition(new Point(50, 20));
        } else if (playerNumber == 1) {
            this.player.basicObject.setPosition(new Point(50, 20));
            this.otherPlayer.basicObject.setPosition(new Point(50, 80));
        }
        console.log("||onJoinedRoom--> player number: " + playerNumber + " Room: " + SocketManager.getRoom().id);
    }

    this.onReceiveOtherPlayerVectorAndPosition = function(position, vector) {
        this.otherPlayer.basicObject.setPosition(position);
        this.otherPlayer.basicObject.setVector(vector);
    }

    this.onReceiveBallVectorAndPosition = function(ballId, position, vector, ownerNumber) {
        if (SocketManager.getRoom().getPlayerNumber() != 0) {
            for (var i=0; i<this.basicObjects.length; i++) {
                if (this.basicObjects[i] instanceof Ball &&
                        ballId == this.basicObjects[i].basicObject.id) {
                    this.basicObjects[i].basicObject.setPosition(position);
                    this.basicObjects[i].basicObject.setVector(vector);
                    this.basicObjects[i].setOwner(ownerNumber);
                    if (ownerNumber == SocketManager.getRoom().getPlayerNumber()) {
                        this.basicObjects[i].basicObject.getBasicObjectDrawer().setColor(this.player.basicObject.getBasicObjectDrawer().getColor());
                    } else if(ownerNumber !=-1) {
                        this.basicObjects[i].basicObject.getBasicObjectDrawer().setColor(this.otherPlayer.basicObject.getBasicObjectDrawer().getColor());
                    }
                    return;
                }
            }
        }
    }

    this.gameIsStarted = function(){
        return this.isGameStarted;
    }
}
