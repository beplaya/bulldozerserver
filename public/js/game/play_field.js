function PlayField() {

    this.playController;

    this.setPlayController = function(playController) {
        this.playController = playController;
    }

    this.onTouchEvent = function(x, y) {
        x = 100*x/PlayField.dimensions.x;
        y = 100*y/PlayField.dimensions.y;
        //console.log(x, y);
        this.playController.onTargetSelected(new Target(x, y));
    }

    this.onDraw = function(canvas, width, height) {
        PlayField.dimensions.x = width;
        PlayField.dimensions.y = height;
        //canvas.drawColor(Color.BLACK);
        if (this.playController != null) {
            var bos = this.playController.getAll();
            for (var i=0; i<bos.length; i++) {
                bos[i].basicObject.getBasicObjectDrawer().onDraw(canvas);
            }
        }
    }

}

PlayField.dimensions = new Point(1, 1);

PlayField.getAbsolutePosition = function(position) {
    return new Point(PlayField.dimensions.x * (position.x / 100), PlayField.dimensions.y * (position.y / 100));
}
