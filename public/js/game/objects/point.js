function Point(xOrPosition, y){

    if(xOrPosition instanceof Point) {
        this.x = xOrPosition.x;
        this.y = xOrPosition.y;
    } else {
        this.x = xOrPosition;
        this.y = y;
    }

    this.set = function(x, y){this.x = x; this.y = y;}
}