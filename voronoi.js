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
        for (let e of this.edges) {
            if (tri.containsEdge(e)) {
                return true;
            }
        }
        return false;
    }

    equals(tri) {
        return tri.containsEdge(this.edges[0]) && tri.containsEdge(this.edges[1]) && tri.containsEdge(this.edges[2]);
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
        //return Math.abs(p.x - this.x) < EPSILON && Math.abs(p.y - this.y) < EPSILON;
    }

    distanceTo(pt) {
        return Math.sqrt((Math.pow(pt.x-this.x,2))+(Math.pow(pt.y-this.y,2)));
    };
}

class Edge {
    constructor(pt1, pt2) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.midpoint = this.midpoint();
    }

    midpoint() {
        return new Point((this.pt1.x + this.pt2.x) / 2, (this.pt1.y + this.pt2.y) / 2);
    }

    slope() {
        return (this.pt2.y - this.pt1.y) / (this.pt1.x - this.pt2.x);
    }

    perpendicularSlope() {
        return -1 / this.slope();
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

        // Find all triangles containing pt in circumcircle
        let circTriangles = [];
        for (let tri of this.triangles) {
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

        let uniqueEdges = [];
        for (let i = 0; i < edgeBuffer.length; i++) {
            if (edgeBuffer[i].isUniqueIn(edgeBuffer)) {
                uniqueEdges.push(edgeBuffer[i]);
            }
        }

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
        var sPts = this.superPoints;
        this.points = this.points.filter(function(el) {
            for (let sPt of sPts) {
                if (sPt.equals(el)) {
                    return false;
                }
            }
            return true;
        });
    }

    getNeighbors(triangle) {
        var tris = [];
        for (let tri of this.triangles) {
            if (triangle.equals(tri)) {
                continue;
            }
            if (tri.sharesEdge(triangle)) {
                tris.push(tri);
            }
        }
        return tris;
    }

    setHasEdge(_set, e) {
        for (let edge of _set) {
            if (e.equals(edge)) {
                return true;
            }
        }
        return false;
    }

    draw(c) {

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

        /*
        This does a depth first search to connect all the circumcenters
        together.
        */
        var stack = [this.triangles[0]]; // Triangles
        var visited = new Set(); // Edges
        while (stack.length != 0) { // Inner voronoi edges
            var triangle = stack.pop();
            var neighbors = this.getNeighbors(triangle);
            for (let neighbor of neighbors) {
                var voronoiEdge = new Edge(neighbor.center, triangle.center);
                if (!this.setHasEdge(visited, voronoiEdge)) {
                    // If the edge hasn't been seen before
                    visited.add(voronoiEdge);
                    stack.push(neighbor);
                    c.drawLine({
                        strokeStyle: 'red',
                        strokeWidth: 4,
                        x1: neighbor.center.x, y1: neighbor.center.y,
                        x2: triangle.center.x, y2: triangle.center.y,
                        closed: true,
                        rounded: true
                    });
                }
            }
        }

        /*
            The above code cannot add voronoi edges when there is no neighbor
            i.e. an edge that goes off screen. The following implements that.
        */
        for (let tri of this.triangles) {
            var neighbors = this.getNeighbors(tri);
            var edgesToDrawToBorder = [];
            if (neighbors.length < 3) {
                for (let edge of tri.edges) {
                    var neighborEdge = false;
                    for (let neighbor of neighbors) {
                        if (neighbor.containsEdge(edge)) {
                            neighborEdge = true;
                        }
                    }
                    if (!neighborEdge) {
                        edgesToDrawToBorder.push(edge);

                        c.drawLine({
                            strokeStyle: 'purple',
                            strokeWidth: 4,
                            x1: edge.pt1.x, y1: edge.pt1.y,
                            x2: edge.pt2.x, y2: edge.pt2.y,
                            closed: true,
                            rounded: true
                        });
                    }
                }
                /*
                edgesToDrawToBorder is now a list of all edges where
                voronoi edges must be used. If you take the perpendicular
                slope of this edge and draw from the edge of the screen to
                the circumcenter of the triangle, the voronoi diagram will
                be complete.
                */
                for (let edgeToDraw of edgesToDrawToBorder) {
                    c.drawLine({
                        strokeStyle: 'red',
                        strokeWidth: 4,
                        x1: edgeToDraw.midpoint.x, y1: edgeToDraw.midpoint.y,
                        x2: tri.center.x, y2: tri.center.y,
                        closed: true,
                        rounded: true
                    });
                }
            }
        }

        // Draw vertices
        for (let p of this.points) {
            c.drawArc({
                strokeStyle: 'steelBlue',
                strokeStyle: 'blue',
                strokeWidth: 4,
                x: p.x, y: p.y,
                radius: 2
            });
        }
    }
}

let pNum = 10;
const C_WIDTH = 1000;
const C_HEIGHT = 700;

$(function() {
    let points = [];

    // for (var i = 0; i < pNum; i++) {
    //   points.push(new Point(Math.random() * C_WIDTH, Math.random() * C_HEIGHT));
    // }
    $("#canvas").click(function(event) {
        var $canvas = $("#canvas");
        var x = event.offsetX;
        var y = event.offsetY;
        points.push(new Point(x, y));



        if (points.length >= 3) {
            $canvas.clearCanvas();
            let v = new Voronoi(points);
            v.generate();
            v.draw($canvas);

        } else {
        $canvas.drawArc({
                strokeStyle: 'steelBlue',
                strokeStyle: 'blue',
                strokeWidth: 4,
                x: x, y: y,
                radius: 2
            });
        }
    });
});
