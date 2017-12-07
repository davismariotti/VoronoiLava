class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        var circumcircle = this.circumcircle();
        this.center = circumcircle.center;
        this.rad = circumcircle.rad;
    }

    circumscribes(pt) {
        return pt.distanceTo(this.center) < this.rad;
    }

    shareVertex(t) {
        return (
            t.p1 == this.p1 || t.p1 == this.p2 || t.p1 == this.p3 ||
            t.p2 == this.p1 || t.p2 == this.p2 || t.p2 == this.p3 ||
            t.p3 == this.p1 || t.p3 == this.p2 || t.p3 == this.p3
        );
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

    equals(p) {
        return p.x == this.x && p.y == this.y;
    }

    distanceTo(pt) {
        return Math.sqrt((Math.pow(pt.x-this.x,2))+(Math.pow(pt.y-this.y,2)));
    };
}

class Edge {
    constructor(pt1, pt2) {
        this.pt1 = pt1;
        this.pt2 = pt2;
    }

    equals(edge) {
        return edge.pt1.equals(this.pt1) && edge.pt2.equals(this.pt2) ||
               edge.pt2.equals(this.pt1) && edge.pt1.equals(this.pt2);
    }

    isUniqueIn(edges) {
        for (let e of edges) {
            if (e == this) {
                continue;
            }
            if (this.equals(e)) return false;
        }
        return true;
    }
}

class Voronoi {
    constructor(points) {
        this.points = points;
        this.triangles = [];
        this.superTriangles = [];
        this._tris = [];
        
    }

    generate() {
        this.superTriangles = this.generateSuperTriangles();

        for (let i = 0; i < this.points.length; i++) {
            this.addVertex(i);
        }
        
        let mTriangles = [];
        for (let tri of this.triangles) {
            let sharesVertex = false;
            for (let sTri of this.superTriangles) {
                if (sTri.shareVertex(tri)) {
                    sharesVertex = true;
                    break;
                }
            }
            
            if (!sharesVertex) {
                mTriangles.push(tri);
            }
        }
        this.triangles = mTriangles;
        this.points = this.points.slice(0, this.points.length-4);
        
        let ptToTri = {};
        for (let t of this.triangles) {
            ptToTri[t.pt1] = t;
            ptToTri[t.pt2] = t;
            ptToTri[t.pt3] = t;
        }
        
        let ptNeighbors = {};
        for (let pt of this.points) {
            let _triangles  = ptToTri[pt];
            let neighbors = new Set();
            if (_triangles != null) {
                for (let j = 0; j < _triangles.length; j++) {
                    let t = _triangles[j];
                    if (t.pt1 != pt) {
                        neighbors.add(t.pt1);
                    }
                    if (t.pt2 != pt) {
                        neighbors.add(t.pt2);
                    }
                    if (t.pt3 != pt) {
                        neighbors.add(t.pt3);
                    }
                }
            }
            ptNeighbors[pt] = neighbors;
        }
    }

    addVertex(pIdx) {
        let pt = this.points[pIdx];
        console.log('POINT' , pt);

        // Find all triangles containing pt in circumcircle
        let circTriangles = [];
        for (let tri of this.triangles) {
            console.log('TRIANGLE', tri);
            console.log('CIRCUMSCRIBES', tri.circumscribes(pt));
            if (tri.circumscribes(pt)) {
                circTriangles.push(tri);
            }
        }

        // Remove all triangles containing pt in circumcircle
        this.triangles = this.triangles.filter(
            _tri => circTriangles.indexOf(_tri) == -1
        )

        let edgeBuffer = [];
        for (let t of circTriangles) {
            edgeBuffer.push(
                new Edge(t.p1, t.p2),
                new Edge(t.p2, t.p3),
                new Edge(t.p3, t.p1)
            );
        }

        console.log('edgeBuffer', edgeBuffer);

        let uniqueEdges = [];
        for (let i = 0; i < edgeBuffer.length; i++) {
            if (edgeBuffer[i].isUniqueIn(edgeBuffer)) {
                uniqueEdges.push(edgeBuffer[i]);
            }
        }

        console.log('edgeBuffer UPDATED', edgeBuffer);

        for (let e of uniqueEdges) {
            this.triangles.push(new Triangle(pt, e.pt1, e.pt2));
            this._tris.push(new Triangle(pt, e.pt1, e.pt2));
        }
    }

    generateSuperTriangles() {
        let p1 = new Point(-0.1, -0.1);
        let p2 = new Point(C_WIDTH + 0.1, -0.1);
        let p3 = new Point(-0.1, C_HEIGHT + 0.1);
        let p4 = new Point(C_WIDTH + 0.1, C_HEIGHT + 0.1);

        this.points.push(p1, p2, p3, p4);

        let t1 = new Triangle(p1, p2, p4);
        let t2 = new Triangle(p1, p3, p4);

        this.triangles.push(t1, t2);

        return [t1, t2];
    }
}

let pNum = 10;
const C_WIDTH = 500;
const C_HEIGHT = 500;

$(function() {
    var c = $("#canvas");
    let points = [];

    for (var i = 0; i < pNum; i++) {
      points.push(new Point(Math.random() * C_WIDTH, Math.random() * C_HEIGHT));
    }

    let v = new Voronoi(points);

    v.generate();
    console.log(v);

    for (let p of v.points) {
        c.drawArc({
            strokeStyle: 'steelBlue',
            strokeStyle: 'blue',
            strokeWidth: 4,
            x: p.x, y: p.y,
            radius: 2
        });
    }

    for (let i = 0; i < v.triangles.length-1; i++) {
        let t1 = v.triangles[i];
        let t2 = v.triangles[i+1];
        c.drawLine({
            strokeStyle: 'steelBlue',
            strokeWidth: 4,
            x1: t1.center.x, y1: t1.center.y,
            x2: t2.center.x, y2: t2.center.y,
            closed: true,
            rounded: true
        });
        
        c.drawArc({
            strokeStyle: 'steelBlue',
            strokeStyle: 'blue',
            strokeWidth: 4,
            x: t1.center.x, y: t1.center.y,
            radius: 2
        });
    }

    /*$("#canvas").click(function(event) {
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
    });*/
});
