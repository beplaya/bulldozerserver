function BullDozer(id) {

    BullDozer.LOCAL_PLAYER = "LOCAL_PLAYER";
    BullDozer.REMOTE_PLAYER = "REMOTE_PLAYER";

    this.basicObject = new BasicObject(id);
    this.basicObject.drawer = new BasicObjectDrawer(this, "#fff");
    this.basicObject.speed = 1;
    this.basicObject.hitRadius = 40;
    this.basicObject.position.x = 100;
    this.basicObject.position.y = 200;
    this.basicObject.drag = .1;

    this.basicObject.collideEventHandler = function(basicObject) {
        if (basicObject instanceof Ball) {
            var ball = basicObject;
            ball.onHitByDozer(this.getOwnerNumber(), vector, drawer.getColor());
        }
    }

    this.getOwnerNumber = function() {
        var localNumber = SocketManager.getRoom().getPlayerNumber();
        if (id.equals(BullDozer.LOCAL_PLAYER)) {
            return localNumber;
        } else if (id.equals(BullDozer.REMOTE_PLAYER)) {
            return localNumber == 0 ? 1 : 0;
        }
        return -1;
    }
}
