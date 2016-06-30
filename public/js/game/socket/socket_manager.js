function SocketManager(){

    this.initSocket = function(socketIO) {
        var self = this;
        this.socketIO = socketIO;
        SocketManager.deviceId = Math.random()+""+Math.random();

        //
        this.socketIO.on(SocketManager.JOINED_ROOM, function(jsonObject) {
            SocketManager.room = new Room(jsonObject[Room.JSON.id]);
            SocketManager.room.setPlayerNumber(jsonObject[Room.JSON.playerNumber]);
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.JOINED_ROOM, SocketManager.room);
            }
        });

        this.socketIO.on(SocketManagerREC_VECTOR_POSITION, function(jsonObject) {
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.REC_VECTOR_POSITION, jsonObject);
            }
        });

        this.socketIO.on(REC_BALL_VECTOR_POSITION, function(jsonObject) {
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.REC_BALL_VECTOR_POSITION, jsonObject);
            }
        });
        //
    }

    this.sendPositionAndVector = function(position, vector) {
        this.sendCommand(SocketManager.SEND_VECTOR_POSITION, SocketManager.room.id,
            position.x, position.y,
            vector.magnitude, vector.angle,
            vector.position.x, vector.position.y);
    }

    this.sendBallPosition = function(ball) {
        var position = ball.getPosition();
        var vector = ball.getVector();
        this.sendCommand(SocketManager.SEND_BALL_VECTOR_POSITION,
            SocketManager.room.id,
            ball.id,
            position.x, position.y,
            vector.magnitude, vector.angle,
            vector.position.x, vector.position.y,
            ball.getOwner());
    }

    this.sendCommand = function(methodName, args) {
        args = args || [];
        if (this.socketIO != null) {
            var csv = "";
            for (var i = 0; i < args.length; i++) {
                if (i > 0) {
                    csv += ",";
                }
                csv += args[i];
            }
            this.socketIO.emit(methodName, csv);
        }
    }

}

//Static
SocketManager.room = null;

SocketManager.getInstance = function() {
    if (SocketManager.instance == null) {
        SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
}

SocketManager.Events = {
    REC_VECTOR_POSITION : "REC_VECTOR_POSITION",
    SEND_VECTOR_POSITION : "SEND_VECTOR_POSITION",
    JOINED_ROOM : "JOINED_ROOM",
    SEND_BALL_VECTOR_POSITION : "SEND_BALL_VECTOR_POSITION",
    REC_BALL_VECTOR_POSITION : "REC_BALL_VECTOR_POSITION"
}

SocketManager.isConnected = false;
SocketManager.deviceId;
SocketManager.instance;
SocketManager.socketIO;
SocketManager.socketId = "";
SocketManager.listeners = [];

SocketManager.registerListener = function(listener) {
    SocketManager.listeners.push(listener);
}

SocketManager.clearListeners = function() {
    SocketManager.listeners = [];
}


SocketManager.getRoom = function() {
    return SocketManager.room;
}

SocketManager.isConnected = function() {
    return SocketManager.isConnected;
}

SocketManager.inRoom = function() {
    return SocketManager.room != null;
}
