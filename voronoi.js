const EPSILON = 0.000000001;

class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        var circumcircle = this.circumcircle();
        this.edges = [new Edge(p1, p2), new Edge(p1, p3), new Edge(p2, p3)];
        this.center = circumcircle.center;
        this.rad = circumcircle.rad;
    }

    circumscribes(pt) {
        return pt.distanceTo(this.center) < this.rad;
    }

    containsPoint(point) {
        return point.equals(this.p1) || point.equals(this.p2) || point.equals(this.p3);
    }

    containsEdge(edge) {
        return (this.edges[0].equals(edge)) ||
               (this.edges[1].equals(edge)) ||
               (this.edges[2].equals(edge));
    }

    sharesVertex(t) {
        return t.p1.equals(this.p1) || t.p1.equals(this.p2) || t.p1.equals(this.p3) ||
               t.p2.equals(this.p1) || t.p2.equals(this.p2) || t.p2.equals(this.p3) ||
               t.p3.equals(this.p1) || t.p3.equals(this.p2) || t.p3.equals(this.p3);
    }

    sharesEdge(tri) {
        for (e of this.edges) {
            if (tri.containsEdge(e)) {
                return true;
            }
        }
        return false;
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
        return Math.abs(p.x - this.x) < EPSILON && Math.abs(p.y - this.y);
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
        this.superPoints = []
        this._tris = [];

    }

    generate() {
        this.superTriangles = this.generateSuperTriangles();

        for (let i = 0; i < this.points.length; i++) {
            this.addVertex(i);
        }


        this.removeSuperTriangles();
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
        this.superPoints.push(p1, p2, p3, p4);

        let t1 = new Triangle(p1, p2, p4);
        let t2 = new Triangle(p1, p3, p4);

        this.triangles.push(t1, t2);
        return [t1, t2];
    }

    removeSuperTriangles() {
        let mTriangles = [];
        for (let tri of this.triangles) {
            let sharesVertex = false;
            for (let sTri of this.superTriangles) {
                if (sTri.sharesVertex(tri)) {
                    sharesVertex = true;
                    break;
                }
            }

            if (!sharesVertex) {
                mTriangles.push(tri);
            }
        }
        this.triangles = mTriangles;


        for (var point in this.points) {
            for (var sPt of this.superPoints) {
                if (this.points[point].equals(sPt)) {
                    this.points.splice(point, 1);
                }
            }
        }
    }

    draw(c) {
        for (let p of this.points) {
            c.drawArc({
                strokeStyle: 'steelBlue',
                strokeStyle: 'blue',
                strokeWidth: 4,
                x: p.x, y: p.y,
                radius: 2
            });
        }

        for (let tri of this.triangles) {
            c.drawLine({
                strokeStyle: 'steelBlue',
                strokeWidth: 4,
                x1: tri.p1.x, y1: tri.p1.y,
                x2: tri.p2.x, y2: tri.p2.y,
                x3: tri.p3.x, y3: tri.p3.y,
                closed: true,
                rounded: true
            });
        }
        // Draw circumcircles

        for (let triangle of this.triangles) {
            c.drawArc({
                strokeStyle: 'red',
                strokeWidth: 4,
                x: triangle.center.x, y: triangle.center.y,
                radius: 1
            });
        }

        for (let i = 0; i < this.triangles.length-1; i++) {
            let t1 = this.triangles[i];
            let t2 = this.triangles[i+1];
            c.drawLine({
                strokeStyle: 'red',
                strokeWidth: 4,
                x1: t1.center.x, y1: t1.center.y,
                x2: t2.center.x, y2: t2.center.y,
                closed: true,
                rounded: true
            });

            c.drawArc({
                strokeStyle: 'red',
                strokeWidth: 4,
                x: t1.center.x, y: t1.center.y,
                radius: 2
            });
        }
    }
}

let pNum = 10;
const C_WIDTH = 500;
const C_HEIGHT = 500;

$(function() {
    let points = [];

    // for (var i = 0; i < pNum; i++) {
    //   points.push(new Point(Math.random() * C_WIDTH, Math.random() * C_HEIGHT));
    // }
    //console.log(v);





    $("#canvas").click(function(event) {
        var $canvas = $("#canvas");
        $canvas.clearCanvas();
        var x = event.offsetX;
        var y = event.offsetY;
        points.push(new Point(x, y));
        //console.log(points);

        // $canvas.drawArc({
        //     strokeStyle: 'steelBlue',
        //     strokeStyle: 'blue',
        //     strokeWidth: 4,
        //     x: x, y: y,
        //     radius: 1
        // });

        if (points.length >= 3) {
            let v = new Voronoi(points);
            v.generate();
            v.draw($canvas);

        }
    });
});
