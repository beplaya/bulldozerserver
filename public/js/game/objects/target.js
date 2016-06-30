function Target(xOrPosition, y) {

    this.position = new Point();

    if(xOrPosition instanceof Point) {
        this.position = xOrPosition;
    } else {
        this.position.x = xOrPosition;
        this.position.y = y;
    }

    this.getVector = function(absPosition, speed) {
        var vector = new Vector();
        var apos = PlayField.getAbsolutePosition(this.position);
        var dx = apos.x - absPosition.x;
        var dy = apos.y - absPosition.y;
//        console.log(absPosition, this.position, dy, dx);
        vector.angle = Math.atan(dy/dx);
        vector.position.x = Math.cos(vector.angle);
        vector.position.y = Math.sin(vector.angle);
        vector.magnitude = dx < 0 ? -speed : speed;
        return vector;
    }
}
