function BasicObject(id) {

    this.id = id;
    this.position = new Point(0,0);
    this.speed = .1;
    this.drag = 0;
    this.hitRadius = 10;
    this.target;
    this.drawer = new BasicObjectDrawer(this, "#fff");
    this.vector = new Vector();

    this.setTarget = function(target) {
        this.target = target;
    }

    this.update = function() {
        var boostVX = 1;
        var boostVY = 1;
        if (this.target == null) {
            var offset = 5;
            if (this.position.x < offset) {
                boostVX = 1.1;
            } else if (this.position.x > 100 - offset) {
                boostVX = .9;
            }
            if (this.position.y < offset) {
                boostVY = 1.1;
            } else if (this.position.y > 100 - offset) {
                boostVY = .9;
            }
        } else {
            //console.log("@@",this.vector.getVelocityX());
            this.vector = this.target.getVector(PlayField.getAbsolutePosition(this.getPosition()), this.speed);
            this.target = null;
            //console.log(this.vector);
        }

        this.position.x += this.vector.getVelocityX() * boostVX;
        this.position.y += this.vector.getVelocityY() * boostVY;

        this.getVector().magnitude *= (1 - (this.drag / 100));
    }


    this.onWallCollide = function(wall) {
        this.target = null;
        if (wall == Collisioner.Wall.TOP || wall == Collisioner.Wall.BOTTOM) {
            this.vector.position.y *= -1;
        } else if (wall == Collisioner.Wall.LEFT || wall == Collisioner.Wall.RIGHT) {
            this.vector.position.x *= -1;
        }
    }
    this.onCollide = function(basicObject, original) {
        if(this.collideEventHandler) {
            this.collideEventHandler(basicObject, original);
        }
    }

    this.getBasicObjectDrawer = function() {
        return this.drawer;
    }

    this.getHitRadius = function() {
        return this.hitRadius;
    }

    this.getPosition = function() {
        return this.position;
    }

    this.getSpeed = function() {
        return this.speed;
    }

    this.getTarget = function() {
        return this.target;
    }

    this.getVector = function() {
        return this.vector;
    }

    this.setPosition = function(position) {
        this.position = position;
    }

    this.setVector = function(vector) {
        this.vector = vector;
    }

}
