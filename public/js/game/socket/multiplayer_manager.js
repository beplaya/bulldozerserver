public class MultiplayManager(playVm) {

    this.playVm = playVm;

    this.onConnected = function() {

    }

    this.onDisconnected = function() {

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


    private void onReceiveOtherPlayerVectorAndPosition(Object o) {
        //roomid, position.x, position.y, vector.magnitude, vector.angle, vector.position.x, vector.position.y
        String csv = o.toString();
        String[] split = csv.split(",");
        int start = 1;
        PointF position = getPosition(start, split);
        Vector vector = getVector(start, split);
        playVm.onReceiveOtherPlayerVectorAndPosition(position, vector);
    }

    private Vector getVector(int start, String[] split) {
        Vector vector = new Vector();
        vector.magnitude = Float.parseFloat(split[start + 2]);
        vector.angle = Float.parseFloat(split[start + 3]);
        vector.position.x = Float.parseFloat(split[start + 4]);
        vector.position.y = Float.parseFloat(split[start + 5]);
        return vector;
    }

    private PointF getPosition(int start, String[] split) {
        PointF position = new PointF();
        position.x = Float.parseFloat(split[start]);
        position.y = Float.parseFloat(split[start + 1]);
        return position;
    }

    private int getOwner(int start, String[] split) {
        return Integer.parseInt(split[start + 6]);
    }
}
