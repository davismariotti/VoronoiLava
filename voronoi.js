class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        var circumcircle = this.circumcircle();
        this.center = circumcircle.center;
        this.rad = circumcircle.rad;
    }

    circumcircle() {
        var x2copy = this.p2.x - this.p1.x;
        var y2copy = this.p2.y - this.p1.y;
        var x3copy = this.p3.x - this.p1.x;
        var y3copy = this.p3.y - this.p1.y;

        let b = x2copy * x2copy + y2copy * y2copy;
        let c = x3copy * x3copy + y3copy * y3copy;

        let d = x2copy * y3copy - y2copy * x3copy;

        let x = (y3copy * b - y2copy * c) * 0.5 / d;
        let y = (x2copy * c - x3copy * b) * 0.5 / d;

        return {
            center: new Point(this.p1.x + x, this.p1.y + y),
            rad: (((this.p1.x - this.p1.x + x) ** 2) + ((this.p1.y - this.p1.y + y) ** 2)) ** 0.5
        };
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


let points = [];

$(function() {

    $("#canvas").click(function(event) {
        var $canvas = $("#canvas");
        var x = event.offsetX;
        var y = event.offsetY;
        console.log(x);
        console.log(x);
        points.push(new Point(x, y));
        console.log(points);

        $canvas.drawArc({
            strokeStyle: 'steelBlue',
            strokeStyle: 'blue',
            strokeWidth: 4,
            x: x, y: y,
            radius: 1
        });

        if (points.length == 3) {

            let tri = new Triangle(points[0], points[1], points[2]);

            console.log('test');
            $canvas.drawLine({
                strokeStyle: 'steelBlue',
                strokeWidth: 4,
                x1: points[0].x, y1: points[0].y,
                x2: points[1].x, y2: points[1].y,
                x3: points[2].x, y3: points[2].y,
                closed: true,
                rounded: true
            });
            console.log(tri);
            $canvas.drawArc({
                strokeStyle: 'steelBlue',
                strokeStyle: 'blue',
                strokeWidth: 4,
                x: tri.center.x, y: tri.center.y,
                radius: tri.rad
            });
            $canvas.drawArc({
                strokeStyle: 'steelBlue',
                strokeStyle: 'blue',
                strokeWidth: 4,
                x: tri.center.x, y: tri.center.y,
                radius: 1
            });
        }



        //triangulate();
    });
});
