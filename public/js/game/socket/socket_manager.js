function SocketManager(){

    this.initSocket = function(socketIO) {
        var self = this;
        this.socketIO = socketIO;
        SocketManager.deviceId = Math.random()+""+Math.random();

        this.socketIO.on(SocketManager.Events.JOINED_ROOM, function(jsonObject) {
            jsonObject = JSON.parse(jsonObject);
            SocketManager.room = new Room(jsonObject[Room.JSON.id]);
            SocketManager.room.setPlayerNumber(jsonObject[Room.JSON.playerNumber]);
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.Events.JOINED_ROOM, SocketManager.room);
            }
        });

        this.socketIO.on(SocketManager.Events.REC_VECTOR_POSITION, function(jsonObject) {
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.Events.REC_VECTOR_POSITION, jsonObject);
            }
        });

        this.socketIO.on(SocketManager.Events.REC_BALL_VECTOR_POSITION, function(jsonObject) {
            //console.log(SocketManager.Events.REC_BALL_VECTOR_POSITION, jsonObject);
            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.Events.REC_BALL_VECTOR_POSITION, jsonObject);
            }
        });

        this.socketIO.on(SocketManager.Events.GAME_ROOM_FILLED, function(csv) {
            console.log("!@@@@@GAME_ROOM_FILLED@@@@@!");

            for (var i=0; i<SocketManager.listeners.length; i++) {
                SocketManager.listeners[i].onEvent(SocketManager.Events.GAME_ROOM_FILLED, csv);
            }
        });
        //
    }

    this.sendPositionAndVector = function(position, vector) {
        if(SocketManager.room) {
            this.sendCommand(SocketManager.Events.SEND_VECTOR_POSITION,
                [SocketManager.room.id,
                position.x, position.y,
                vector.magnitude, vector.angle,
                vector.position.x, vector.position.y]);
        }
    }

    this.sendBallPosition = function(ball) {
        var ballBasicObject = ball.basicObject;
        var position = ballBasicObject.getPosition();
        var vector = ballBasicObject.getVector();
        this.sendCommand(SocketManager.Events.SEND_BALL_VECTOR_POSITION,
            [SocketManager.room.id,
            ballBasicObject.id,
            position.x, position.y,
            vector.magnitude, vector.angle,
            vector.position.x, vector.position.y,
            ball.getOwner()]);
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
            //console.log("emit", methodName, csv);
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
    REC_BALL_VECTOR_POSITION : "REC_BALL_VECTOR_POSITION",
    GAME_ROOM_FILLED : "GAME_ROOM_FILLED"
}

SocketManager.isConnected = false;
SocketManager.deviceId;
SocketManager.instance;
SocketManager.socketIO;
SocketManager.socketId = "";
SocketManager.listeners = [];

SocketManager.registerListener = function(listener) {
    for (var i=0; i<SocketManager.listeners.length; i++) {
        if(SocketManager.listeners[i] == listener){
            return;
        }
    }
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
