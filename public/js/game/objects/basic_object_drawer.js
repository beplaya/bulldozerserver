function BasicObjectDrawer(basicObject, color) {

    this.basicObject = basicObject;
    this.color = color;

    this.onDraw = function(canvas) {
        if (basicObject != null) {
            var ctx = canvas.getContext("2d");
            var absPosition = PlayField.getAbsolutePosition(basicObject.getPosition());
            ctx.strokeStyle(this.color || "#000");
            ctx.beginPath();
            ctx.arc(absPosition.x, absPosition.y, basicObject.getHitRadius(), 0, 2*Math.PI);
            ctx.stroke();
        }
    }

    this.setColor = function(color) {
        this.color = color;
    }

    this.getColor = function() {
        return this.color;
    }
}