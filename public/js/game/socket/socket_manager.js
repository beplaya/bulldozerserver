function SocketManager(){

    SocketManager.room = null;

    SocketManager.getInstance = function() {
        if (SocketManager.instance == null) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    SocketManager.Events {
        REC_VECTOR_POSITION : "REC_VECTOR_POSITION",
        SEND_VECTOR_POSITION : "SEND_VECTOR_POSITION",
        JOINED_ROOM : "JOINED_ROOM",
        SEND_BALL_VECTOR_POSITION : "SEND_BALL_VECTOR_POSITION",
        REC_BALL_VECTOR_POSITION : "REC_BALL_VECTOR_POSITION"
    }

//  SocketManager.DEFAULT_URL = "http://192.168.1.69:8080";
//  SocketManager.DEFAULT_URL = "http://10.206.4.56:8080";
    SocketManager.DEFAULT_URL = "http://192.168.43.24:8080";
    SocketManager.URL = DEFAULT_URL;
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

    this.connect(socketIO) {
        var self = this;
        this.socketIO = socketIO;
        SocketManager.deviceId = Math.random()+""+Math.random();
        for (var i=0; i<SocketManager.listeners.length; i++) {
            SocketManager.listeners[i].onConnected();
        }
        this.disconnect();

        this.socketIO.connect();
        this.createConnectionStatusEventListeners();

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

    this.createConnectionStatusEventListeners = function() {
        var self = this;
        this.socketIO.on('disconnect', function(jsonObject) {
            SocketManager.isConnected = false;
        });
        this.socketIO.on('connected', function(jsonObject) {
            SocketManager.isConnected = true;
        });
    }

    this.disconnect = function() {
        var self = this;
        SocketManager.isConnected = false;
        SocketManager.room = null;
        if (this.socketIO != null) {
            try {
                for (var i=0; i<SocketManager.listeners.length; i++) {
                    SocketManager.listeners[i].onDisconnected();
                }
                this.socketIO.disconnect();
                this.socketIO.close();
                this.socketIO = null;
            } catch (e) {
                console.log(e);
            }
        }
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
            for (int i = 0; i < args.length; i++) {
                if (i > 0) {
                    csv += ",";
                }
                csv += args[i];
            }
            this.socketIO.emit(methodName, csv);
        }
    }

}
