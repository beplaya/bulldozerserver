function PlayField() {

    this.playController;

    this.setPlayController = function(playController) {
        this.playController = playController;
    }

    this.onTouchEvent = function(x, y) {
        if(this.playController.gameIsStarted()) {
            x = 100*x/PlayField.dimensions.x;
            y = 100*y/PlayField.dimensions.y;
            this.playController.onTargetSelected(new Target(x, y));
        }
    }

    this.onDraw = function(canvas, width, height) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
