function Ball(id, x, y) {

    this.owner = -1;
    this.basicObject = new BasicObject(id);
    this.basicObject.drawer = new BasicObjectDrawer(this, "#f00");
    this.basicObject.position.x = x;
    this.basicObject.position.y = y;
    this.basicObject.drag = 10;
    this.basicObject.oobDrag = -.2;

    this.basicObject.collideEventHandler = function(onScreenObject, original) {
    }

    this.onHitByDozer = function(owner, vector, color) {
        this.basicObject.vector.angle = vector.angle;
        this.basicObject.vector.position.x = vector.position.x;
        this.basicObject.vector.position.y = vector.position.y;
        this.basicObject.vector.magnitude = vector.magnitude * 4;
        this.basicObject.vector.magnitude *= .7;
        this.owner = owner;
        this.basicObject.drawer.setColor(color);
    }

    this.getOwner = function() { return this.owner; }
    this.setOwner = function(owner) { this.owner = owner; }

    this.isOwned = function() { return this.owner != -1;}
}
