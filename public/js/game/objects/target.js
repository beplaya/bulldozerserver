function Target(xOrPosition, y) {

    this.position = new Point();

    if(xOrPosition instanceof Point) {
        this.position = xOrPosition;
    } else {
        this.position.x = x;
        this.position.y = y;
    }

    this.getVector = function(absPosition, speed) {
        var vector = new Vector();

        var dx = this.position.x - absPosition.x;
        var dy = this.position.y - absPosition.y;

        vector.angle = Math.atan(dy / dx);
        vector.position.x = Math.cos(vector.angle);
        vector.position.y = Math.sin(vector.angle);
        vector.magnitude = dx < 0 ? -speed : speed;
        return vector;
    }
}
