function Collisioner(playController) {

    this.playController = playController;

    this.update = function() {
        //basic objects list
        var bos = playController.getAll();
        for (var i = 0; i < bos.length; i++) {
            var wall = this.detectWall(bos[i]);
            if (wall != null) {
                bos[i].basicObject.onWallCollide(wall);
            }
            for (var j = 0; j < bos.length; j++) {
                if (i != j) {
                    if (this.doesCollide(bos[i], bos[j])) {
                        bos[i].basicObject.onCollide(bos[j].basicObject);
                        bos[j].basicObject.onCollide(bos[i].basicObject);
                    }
                }
            }
        }
    }

    this.detectWall = function(onScreenObject) {
        var basicObject = onScreenObject.basicObject;
        var percentPosition = basicObject.getPosition();
        var offset = 5;
        if (percentPosition.x < offset) {
            return Collisioner.Wall.LEFT;
        } else if (percentPosition.y < offset) {
            return Collisioner.Wall.TOP;
        } else if (percentPosition.x > 100 - offset) {
            return Collisioner.Wall.RIGHT;
        } else if (percentPosition.y > 100 - offset) {
            return Collisioner.Wall.BOTTOM;
        }
        return null;
    }

    this.doesCollide = function(a, b) {
        var ap = PlayField.getAbsolutePosition(a.basicObject.getPosition());
        var bp = PlayField.getAbsolutePosition(b.basicObject.getPosition());
        var dx = Math.abs(ap.x - bp.x);
        var dy = Math.abs(ap.y - bp.y);
        var h = Math.sqrt((dx * dx) + (dy * dy));
        if (h <= a.basicObject.getHitRadius() || h <= b.basicObject.getHitRadius()) {
            return true;
        }
        return false;
    }
}


Collisioner.Wall = {
    LEFT:0, TOP:1, RIGHT:2, BOTTOM:3
}