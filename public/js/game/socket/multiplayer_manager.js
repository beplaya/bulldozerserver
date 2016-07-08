function MultiplayManager(playVm) {

    this.playVm = playVm;

    this.onConnected = function() {
        console.log('onConnected');
    }

    this.onDisconnected = function() {
        console.log('onDisconnected');
    }

    this.onEvent = function(event, o) {
        var self = this;
        if (event == SocketManager.Events.JOINED_ROOM) {
            this.playVm.onJoinedRoom();
        } else if (event == SocketManager.Events.REC_VECTOR_POSITION) {
            this.onReceiveOtherPlayerVectorAndPosition(o);
        } else if (event == SocketManager.Events.REC_BALL_VECTOR_POSITION) {
            this.onReceiveBallVectorAndPosition(o);
        } else if(event == SocketManager.Events.GAME_ROOM_FILLED) {
            var args = o.split(',');
            var localTime = new Date().getTime();
            var serverTime = args[0]*1;
            var delay = args[1]*1;
            var timeDiff = localTime - serverTime;
            var fixedDelay = delay - timeDiff;
            console.log("Start game in ", fixedDelay, "ms");
            self.playVm.startingGame();
            setTimeout(function(){
                self.playVm.startGame();
            }, fixedDelay)
        } else if(event == SocketManager.Events.WIN) {
            var winner = o.winner;
            self.playVm.onWin(winner);
        }
        return "mmm";
    }

    this.onReceiveBallVectorAndPosition = function(o) {
        //roomid, ballid, position.x, position.y, vector.magnitude, vector.angle, vector.position.x, vector.position.y, owner
        var csv = o.toString();
        var split = csv.split(",");
        var ballId = split[1];
        var start = 2;
        var position = this.getPosition(start, split);
        var vector = this.getVector(start, split);
        var owner = this.getOwner(start, split);
        this.playVm.onReceiveBallVectorAndPosition(ballId, position, vector, owner);
    }


    this.onReceiveOtherPlayerVectorAndPosition = function(o) {
        //roomid, position.x, position.y, vector.magnitude, vector.angle, vector.position.x, vector.position.y
        var csv = o.toString();
        var split = csv.split(",");
        var start = 1;
        var position = this.getPosition(start, split);
        var vector = this.getVector(start, split);
        this.playVm.onReceiveOtherPlayerVectorAndPosition(position, vector);
    }

    this.getVector = function(start, split) {
        var vector = new Vector();
        vector.magnitude = 1 * split[start + 2];
        vector.angle = 1 * split[start + 3];
        vector.position.x = 1 * split[start + 4];
        vector.position.y = 1 * split[start + 5];
        return vector;
    }

    this.getPosition = function(start, split) {
        var position = new Point();
        position.x = 1 * split[start];
        position.y = 1 * split[start + 1];
        return position;
    }

    this.getOwner = function(start, split) {
        return 1 * split[start + 6];
    }
}
