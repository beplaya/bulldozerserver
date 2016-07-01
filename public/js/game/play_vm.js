function PlayVm() {

    this.basicObjects = [];
    this.playField;
    this.player;
    this.collisioner;
    this.otherPlayer;
    this.balls;
    this.period = 33;


    this.getMousePos = function(canvasDom, mouseEvent) {
      var rect = canvasDom.getBoundingClientRect();
      return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
      };
    }

    this.onCreate = function() {
        var self = this;
        this.canvas = document.getElementById("myCanvas");

        this.canvas.addEventListener("mouseup", function (e) {
            var mousePos = self.getMousePos(self.canvas, e);
            self.playField.onTouchEvent(mousePos.x, mousePos.y);
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
        SocketManager.registerListener(new MultiplayManager(this));
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

    this.onTimerTick = function() {
        //if (SocketManager.isConnected && SocketManager.inRoom()) {
        if (SocketManager.isConnected) {
            this.playField.onDraw(this.canvas, this.canvas.width, this.canvas.height);

            for (var i=0; i<this.basicObjects.length; i++) {
                this.basicObjects[i].basicObject.update();
            }

            if(SocketManager.getRoom()) {
                this.collisioner.update();
                SocketManager.getInstance().sendPositionAndVector(this.player.basicObject.getPosition(), this.player.basicObject.getVector());
                if (SocketManager.getRoom().getPlayerNumber() == 0) {
                    for (var i=0; i<this.balls.length; i++) {
                        SocketManager.getInstance().sendBallPosition(this.balls[i]);
                    }
                }
            }
        }
    }

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
}
