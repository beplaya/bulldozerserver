function Vector() {
    this.position = new Point();
    this.magnitude = 0;
    this.angle = 0;

    this.getVelocityX = function() {
        return (this.position.x * this.magnitude);
    }

    this.getVelocityY = function() {
        return (this.position.y * this.magnitude);
    }
}
