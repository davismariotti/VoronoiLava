const EPSILON = 0.000000001;
const C_WIDTH = 1000;
const C_HEIGHT = 700;

function areaOfTriangle(p1, p2, p3) {
    return Math.abs((p1.x * (p2.y - p3.y) +
                     p2.x * (p3.y - p1.y) +
                     p3.x * (p1.y - p2.y)) / 2.0);
}

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

    containsVertex(point) {
        return point.equals(this.p1) || point.equals(this.p2) || point.equals(this.p3);
    }

    containsEdge(edge) {
        return (this.edges[0].equals(edge)) ||
               (this.edges[1].equals(edge)) ||
               (this.edges[2].equals(edge));
    }

    containsPoint(point) {
        var a = areaOfTriangle(this.p1, this.p2, this.p3);
        var a1 = areaOfTriangle(point, this.p2, this.p3);
        var a2 = areaOfTriangle(this.p1, point, this.p3);
        var a3 = areaOfTriangle(this.p1, this.p2, point);
        return a == (a1 + a2 + a3);
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

    minusEdge(edge) {
        if (!edge.containsVertex(this.p1)) {
            return this.p1;
        } else if (!edge.containsVertex(this.p2)) {
            return this.p2;
        } else {
            return this.p3;
        }
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

    jsonify() {
        return {'x': this.x, 'y': this.y};
    }
}

class Edge {
    constructor(pt1, pt2) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.midpoint = this.midpoint();
    }

    jsonify() {
        return {'p1': this.pt1.jsonify(), 'p2': this.pt2.jsonify()};
    }

    midpoint() {
        return new Point((this.pt1.x + this.pt2.x) / 2, (this.pt1.y + this.pt2.y) / 2);
    }

    slope() {
        return (this.pt2.y - this.pt1.y) / (this.pt2.x - this.pt1.x);
    }

    containsVertex(point) {

        console.log("point", point);
        return this.pt1.equals(point) || this.pt2.equals(point);
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
        this.generate();
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

    edgeInArray(testEdge, arr) {
        for (let edge of arr) {
            if (testEdge.equals(edge)) {
                return true;
            }
        }
        return false;
    }

    data() {
        var output = {};
        var triangleEdges = [];
        var triangleEdgesTemp = [];
        var voronoiEdges = [];
        var pointsOut = [];

        for (let point of this.points) {
            pointsOut.push(point.jsonify());
        }
        output['points'] = pointsOut;

        for (let triangle of this.triangles) {
            for (let e of triangle.edges) {
                if (!this.edgeInArray(e, triangleEdgesTemp)) {
                    triangleEdgesTemp.push(e);
                }
            }
        }

        for (let edge of triangleEdgesTemp) {
            triangleEdges.push(edge.jsonify());
        }

        output['triangulation'] = triangleEdges;

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
                    voronoiEdges.push(new Edge(
                        new Point(neighbor.center.x, neighbor.center.y),
                        new Point(triangle.center.x, triangle.center.y)).jsonify());
                }
            }
        }
        output['voronoi'] = voronoiEdges;
        return output;
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
        This does a depth first traversal to connect all the circumcenters
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
                            strokeStyle: 'steelBlue',
                            strokeWidth: 4,
                            x1: edge.pt1.x, y1: edge.pt1.y,
                            x2: edge.pt2.x, y2: edge.pt2.y,
                            closed: true,
                            rounded: true
                        });
                    }
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

class Demo {
    constructor() {
        this.voronoi = new Voronoi([]),
        this.sites = [],
        this.diagram = null,
        this.margin = 0.15,
        this.canvas = document.getElementById('canvas'),
        this.bbox = {
            xl: 0,
            xr: 800,
            yt: 0,
            yb: 600
        },
        this.lavaRender = null
    }
    
    runStatic() {
        canvas.addEventListener('click',(e) => {
            console.log(this.diagram);
            this.sites.push(new Point(e.offsetX, e.offsetY));
            this.recompute();
            this.renderStatic();
        }, false);
        if (this.lavaRender) {
            clearInterval(this.lavaRender);
        }
        // Generate random distribution of sites
        //this.genRandomSites(20);
        this.recompute();
        this.renderStatic();
    }
    
    runLavaSim() {
        // Generate random distribution of sites
        this.genRandomSites(20);
        for (let site of this.sites) {
            site.xv = Math.random() * 5;
            site.yv = Math.random() * 2;
            site.a = 1.0;
        }
        // Main render loop
        this.lavaRender = setInterval(() => {
            this.recompute();
            this.renderLava();
            // Update position and velocity for each point
            for (let site of this.sites) {
                site.x -= site.xv + 1 * site.a;
                site.y -= site.yv + 0.2 * site.a;
                site.x -= 2;
                site.xv *= .998;
                site.yv *= .998;
                site.a *= 1.001;
            }
            // Randomly generate new points
            if (Math.floor(Math.random() * 15) == 0) {
                let tmp_site = new Point(this.canvas.width*1.5, this.canvas.height*1.0);
                tmp_site.xv = Math.random() * 5;
                tmp_site.yv = Math.random() * 2;
                tmp_site.a = 1.0;
                this.sites.push(tmp_site);
            }
            // TODO: We should probably remove points over time as they leave the screen
      }, 50);
    }

    genRandomSites(numSites) {
        this.sites = [];
        // Generate random vertices within given range
        let dx = this.canvas.width * 2;
        let dy = this.canvas.height * 2;
        for (var i = 0; i < numSites; i++) {
            this.sites.push(new Point(
                Math.random() * dx + Math.random() / dx,
                Math.random() * dy + Math.random() / dy
            ));
        }
        var v = new Voronoi(this.sites);
        this.diagram = v.data();
    }

    recompute() {
        var v = new Voronoi(this.sites);
        this.diagram = v.data();
    }

    renderStatic() {
        var ctx = this.canvas.getContext('2d');
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.stroke();
        // Render voronoi
        if (!this.diagram) {
            return;
        }
        // Render edges of voronoi diagram
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        for (let edge of this.diagram.voronoi) {
            ctx.moveTo(edge.p1.x, edge.p1.y);
            ctx.lineTo(edge.p2.x, edge.p2.y);
        }
        ctx.stroke();
        if ($('#show_delaunay').prop('checked')) {
            ctx.beginPath();
            ctx.strokeStyle = '#1cd704';
            ctx.lineWidth = 5;
            for (let edge of this.diagram.triangulation) {
                ctx.moveTo(edge.p1.x, edge.p1.y);
                ctx.lineTo(edge.p2.x, edge.p2.y);
            }
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = '#c91200';
        for (let v of this.sites) {
            ctx.rect(v.x-2, v.y - 2, 4, 4);
        }
        ctx.fill();
    }

    renderLava() {
        var ctx = this.canvas.getContext('2d');
        // Render background
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#360000';
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.stroke();
        // Render voronoi
        if (!this.diagram) {
            return;
        }
        // Render edges of voronoi diagram
        ctx.beginPath();
        ctx.strokeStyle = '#4b0707';
        ctx.lineWidth = 40;
        for (let edge of this.diagram.voronoi) {
            ctx.moveTo(edge.p1.x, edge.p1.y);
            ctx.lineTo(edge.p2.x, edge.p2.y);
        }
        // Different strokes styles for gradient effect
        ctx.stroke();
        ctx.strokeStyle = '#a22706';
        ctx.lineWidth = 15;
        ctx.stroke();
        ctx.strokeStyle = '#f0bc48';
        ctx.lineWidth = 7
        ctx.stroke();
        ctx.strokeStyle = '#ffe68f';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = '#c91200';
        for (let v of this.sites) {
            ctx.rect(v.x - 2 / 3, v.y - 2 / 3, 2, 2);
        }
        ctx.fill();
    }
}

$(function() {
    let demo = new Demo();
    let $dropDown = $('#demo_options');
    let $delaunayCheckBox = $('#show_delaunay')
    $dropDown.on('change', () => {
        if ($dropDown.val() == 'static') {
            demo.runStatic();
        } else if ($dropDown.val() == 'lava') {
            demo.runLavaSim();
        }
    });
    $delaunayCheckBox.on('change', () => {
        demo.renderStatic();
    });
    demo.runStatic();
});
