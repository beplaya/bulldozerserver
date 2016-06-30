function MultiplayManager(playVm) {

    this.playVm = playVm;

    this.onConnected = function() {
        console.log('onConnected');
    }

    this.onDisconnected = function() {
        console.log('onDisconnected');
    }

    this.onEvent = function(event, o) {
        if (event == SocketManager.JOINED_ROOM) {
            this.playVm.onJoinedRoom();
        } else if (event == SocketManager.REC_VECTOR_POSITION) {
            this.onReceiveOtherPlayerVectorAndPosition(o);
        } else if (event == SocketManager.REC_BALL_VECTOR_POSITION) {
            this.onReceiveBallVectorAndPosition(o);
        }
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
