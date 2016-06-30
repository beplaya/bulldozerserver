var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};


var ClassA = function() {
    this.name = "class A";
}

ClassA.prototype.print = function() {
    console.log(this.name);
}


var ClassB = function() {
    inheritsFrom(ClassB, ClassA);
    this.name = "class B";
    this.surname = "I'm the child";
}

ClassB.prototype.print = function() {
    ClassA.prototype.print.call(this);
    console.log(this.surname);
}


var b = new ClassB();
b.print();