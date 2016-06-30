function PlayVm() {

    this.basicObjects = [];
    this.playField;
    this.player;
    this.collisioner;
    this.otherPlayer;
    this.balls;
    this.period = 33;

    this.onCreate() {
        this.canvas = document.getElementById("myCanvas");

        this.playField = new PlayField();
        this.playField.setPlayController(this);
        this.player = new BullDozer(BullDozer.LOCAL_PLAYER);
        this.otherPlayer = new BullDozer(BullDozer.REMOTE_PLAYER);

        this.otherPlayer.basicObject.getBasicObjectDrawer().setColor(Color.CYAN);
        this.collisioner = new Collisioner(this);

        this.player.basicObject.getPosition().set(0, 0);
        this.otherPlayer.basicObject.getPosition().set(0, 0);

        this.basicObjects.add(player);
        this.basicObjects.add(otherPlayer);
        this.balls = new ArrayList<>();

        this.balls.add(new Ball(1, 20, 50));
        this.balls.add(new Ball(2, 40, 50));
        this.balls.add(new Ball(3, 50, 50));
        this.balls.add(new Ball(4, 60, 50));
        this.balls.add(new Ball(5, 80, 50));
        this.basicObjects = this.basicObjects.concat(balls);
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
        if (SocketManager.isConnected() && SocketManager.inRoom()) {
            this.playField.onDraw(this.canvas, this.canvas.width, this.canvas.height);

            for (var i=0; i<this.basicObjects.length; i++) {
                this.basicObjects[i].basicObject.update();
            }

            this.collisioner.update();
            SocketManager.getInstance().sendPositionAndVector(this.player.getPosition(), this.player.getVector());
            if (SocketManager.getRoom().getPlayerNumber() == 0) {
                for (var i=0; i<this.balls.length; i++) {
                    SocketManager.getInstance().sendBallPosition(this.balls[i]);
                }
            }
        }
    }

    this.getAll = function() {
        return this.basicObjects;
    }

    this.onTargetSelected = function(target) {
        this.player.basicObject.setTarget(target);
    }

    this.onJoinedRoom = function() {
        var playerNumber = SocketManager.getRoom().getPlayerNumber();
        if (playerNumber == 0) {
            this.player.setPosition(new Point(50, 80));
            this.otherPlayer.setPosition(new Point(50, 20));
        } else if (playerNumber == 1) {
            this.player.setPosition(new Point(50, 20));
            this.otherPlayer.setPosition(new Point(50, 80));
        }
        console.log("||onJoinedRoom--> player number: " + playerNumber + " Room: " + SocketManager.getRoom().id);
    }

    this.onReceiveOtherPlayerVectorAndPosition(position, vector) {
        this.otherPlayer.setPosition(position);
        this.otherPlayer.setVector(vector);
    }

    this.onReceiveBallVectorAndPosition(ballId, position, vector, ownerNumber) {
        if (SocketManager.getRoom().getPlayerNumber() != 0) {
            for (var i=0; i<this.balls.length; i++) {
                if (ballId.equals(this.balls[i].id)) {
                    this.balls[i].setPosition(position);
                    this.balls[i].setVector(vector);
                    this.balls[i].setOwner(ownerNumber);
                    if (ownerNumber == SocketManager.getRoom().getPlayerNumber()) {
                        this.balls[i].getBasicObjectDrawer().setColor(player.getBasicObjectDrawer().getColor());
                    } else {
                        this.balls[i].getBasicObjectDrawer().setColor(otherPlayer.getBasicObjectDrawer().getColor());
                    }
                    return;
                }
            }
        }
    }
}
