function PlayField() {

    PlayField.dimensions = new Point(1, 1);

    this.playController;

    this.setPlayController = function(playController) {
        this.playController = playController;
    }

    this.onTouchEvent = function(x, y) {
        this.playController.onTargetSelected(new Target(x, y));
    }

    this.onDraw = function(canvas, width, height) {
        if (PlayField.dimensions.x == 1) {
            PlayField.dimensions.x = width;
            PlayField.dimensions.y = height;
        }
        //canvas.drawColor(Color.BLACK);
        if (this.playController != null) {
            var bos = this.playController.getAll();
            for (var i=0; i<bos.length; i++) {
                bos[i].basicObject.getBasicObjectDrawer().onDraw(canvas);
            }
        }
    }

    PlayField.getAbsolutePosition(position) {
        return new Point(PlayField.dimensions.x * (position.x / 100f), PlayField.dimensions.y * (position.y / 100f));
    }

}
