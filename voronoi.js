const C_WIDTH = 1000;
const C_HEIGHT = 700;

/**
 * Finds the area of a triangle
 */
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

    /**
     * Checks if a Triangle circumscribes a Point
     */
    circumscribes(pt) {
        return pt.distanceTo(this.center) < this.rad;
    }

    /**
     * Checks if the triangle contains the specified vertex
     */
    containsVertex(point) {
        return point.equals(this.p1) || point.equals(this.p2) || point.equals(this.p3);
    }

    /**
     * Checks if the triangle contains the specified edge
     */
    containsEdge(edge) {
        return (this.edges[0].equals(edge)) ||
            (this.edges[1].equals(edge)) ||
            (this.edges[2].equals(edge));
    }

    /**
     * Checks if the triangle contains the specified point inside of it
     */
    containsPoint(point) {
        var a = areaOfTriangle(this.p1, this.p2, this.p3);
        var a1 = areaOfTriangle(point, this.p2, this.p3);
        var a2 = areaOfTriangle(this.p1, point, this.p3);
        var a3 = areaOfTriangle(this.p1, this.p2, point);
        return a == (a1 + a2 + a3);
    }

    /**
     * Checks if the triangle shares a vertex with the specified triangle
     */
    sharesVertex(tri) {
        return tri.containsVertex(this.p1) || tri.containsVertex(this.p2) || tri.containsVertex(this.p3);
    }

    /**
     * Checks if the triangle shares an edge with the specified triangle
     */
    sharesEdge(tri) {
        for (let e of this.edges) {
            if (tri.containsEdge(e)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the point on the triangle that is not in the specified edge
     */
    minusEdge(edge) {
        if (!edge.containsVertex(this.p1)) {
            return this.p1;
        } else if (!edge.containsVertex(this.p2)) {
            return this.p2;
        } else {
            return this.p3;
        }
    }

    /**
     * Checks if the triangle equals the specified triangle
     */
    equals(tri) {
        return tri.containsEdge(this.edges[0]) && tri.containsEdge(this.edges[1]) && tri.containsEdge(this.edges[2]);
    }

    /**
     * Calculates the circumcircle of the triangle
     */
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

    /**
     * Checks if the point equals the specified point
     */
    equals(p) {
        return p.x == this.x && p.y == this.y;
    }

    /**
     * Calculates the distance to another specified point
     */
    distanceTo(pt) {
        return Math.sqrt((Math.pow(pt.x - this.x, 2)) + (Math.pow(pt.y - this.y, 2)));
    };

    /**
     * JSONifies the point
     */
    jsonify() {
        return {
            'x': this.x,
            'y': this.y
        };
    }
}

class Edge {
    constructor(pt1, pt2) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.midpoint = this.midpoint();
    }

    /**
     * JSONifies the edge
     */
    jsonify() {
        return {
            'p1': this.pt1.jsonify(),
            'p2': this.pt2.jsonify()
        };
    }


    /**
     * Calculates the midpoint of the edge
     */
    midpoint() {
        return new Point((this.pt1.x + this.pt2.x) / 2, (this.pt1.y + this.pt2.y) / 2);
    }

    /**
     * Checks if the edge contains the specified vertex
     */
    containsVertex(point) {
        return this.pt1.equals(point) || this.pt2.equals(point);
    }

    /**
     * Checks if the edge equals the specified edge
     */
    equals(edge) {
        return edge.pt1.equals(this.pt1) && edge.pt2.equals(this.pt2) ||
            edge.pt2.equals(this.pt1) && edge.pt1.equals(this.pt2);
    }

    /**
     * Checks if the edge is unique in the specified array of edges
     */
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
        this.generate();
    }

    /**
     * Generates the delaunay triangulation
     */
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
            let _triangles = ptToTri[pt];
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

    /**
     * Checks if an array of edges contains a specified edge
     */
    edgeInArray(testEdge, arr) {
        for (let edge of arr) {
            if (testEdge.equals(edge)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the voronoi diagram in JSON format
     */
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

        if (this.triangles && this.triangles.length) {
            var stack = [this.triangles[0]]; // Triangles
            var visited = new Set(); // Edges
            while (stack.length != 0) { // Inner voronoi edges
                var triangle = stack.pop();
                var neighbors = this.getNeighbors(triangle);
                for (let neighbor of neighbors) {
                    var voronoiEdge = new Edge(neighbor.center, triangle.center);
                    if (!this.setContainsEdge(visited, voronoiEdge)) {
                        // If the edge hasn't been seen before
                        visited.add(voronoiEdge);
                        stack.push(neighbor);
                        voronoiEdges.push(new Edge(
                            new Point(neighbor.center.x, neighbor.center.y),
                            new Point(triangle.center.x, triangle.center.y)).jsonify());
                    }
                }
            }
        }
        output['voronoi'] = voronoiEdges;
        return output;
    }

    /**
     * Adds a vertex to the triangulation
     */
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
        }
    }

    /**
     * Generates a super triangle for the triangulation
     */
    generateSuperTriangles() {
        let p1 = new Point(-500 * C_WIDTH, -500 * C_WIDTH);
        let p2 = new Point(1000 * C_WIDTH, -500 * C_WIDTH);
        let p3 = new Point(-500 * C_WIDTH, 1000 * C_WIDTH);

        this.points.push(p1, p2, p3);
        this.superPoints.push(p1, p2, p3);

        let t1 = new Triangle(p1, p2, p3);

        this.triangles.push(t1);
        return [t1];
    }

    /**
     * Removes the super triangle from the data
     */
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

    /**
     * Returns an array of triangles that neighbor the specified triangle
     */
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

    /**
     * Checks if a set contains the specified edge
     */
    setContainsEdge(_set, e) {
        for (let edge of _set) {
            if (e.equals(edge)) {
                return true;
            }
        }
        return false;
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
        this.lavaRender = null,
        this.renderMode = 'static',
        this.trackCursor = false;
    }

    runStatic() {
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
        this.genRandomSites(50);
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
            for (let i = 0; i < this.sites.length; i++) {
                let site = this.sites[i];
                site.x -= site.xv + 1 * site.a;
                site.y -= site.yv + 0.2 * site.a;
                site.x -= 2;
                // Remove sites well offscreen
                if (site.x < -C_WIDTH) {
                    this.sites.splice(i, 1);
                    continue;
                }
                site.xv *= .998;
                site.yv *= .998;
                site.a *= 1.001;
            }
            // Randomly generate new points
            if (Math.floor(Math.random() * 8) == 0) {
                let tmp_site = new Point(this.canvas.width * 1.5, this.canvas.height * 2.0 * Math.random());
                tmp_site.xv = Math.random() * 5;
                tmp_site.yv = Math.random() * 2;
                tmp_site.a = 1.0;
                this.sites.push(tmp_site);
            }
            $('#num_points').html(' Num points: ' + this.sites.length);
        }, 50);
    }

    genRandomSites(numSites) {
        this.sites = [];
        // Generate random vertices within given range
        let dx = this.canvas.width * 2;
        let dy = this.canvas.height * 2;
        for (var i = 0; i < numSites; i++) {
            this.sites.push(new Point(
                (Math.random() * dx + Math.random() / dx) - (this.canvas.width / 2),
                Math.random() * dy + Math.random() / dy - (this.canvas.height / 2)
            ));
        }
        var v = new Voronoi(this.sites.slice());
        this.diagram = v.data();
    }

    recompute() {
        var v = new Voronoi(this.sites.slice());
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
        // Render edges of voronoi diagram
        if ($('#show_voronoi').prop('checked')) {
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 5;
            for (let edge of this.diagram.voronoi) {
                ctx.moveTo(edge.p1.x, edge.p1.y);
                ctx.lineTo(edge.p2.x, edge.p2.y);
            }
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = '#c91200';
        for (let v of this.sites) {
            ctx.rect(v.x - 2, v.y - 2, 4, 2);
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
    let c = document.getElementById('canvas');
    let $dropDown = $('#demo_options');
    let $delaunayCheckBox = $('#show_delaunay')
    let $voronoiCheckbox = $('#show_voronoi')
    $dropDown.on('change', () => {
        if ($dropDown.val() == 'static') {
            demo.runStatic();
            demo.renderMode = 'static';
        } else if ($dropDown.val() == 'lava') {
            demo.runLavaSim();
            demo.renderMode = 'lava';
        }
    });
    c.addEventListener('click', (e) => {
        let tmp_p = new Point(e.offsetX, e.offsetY);
        let unique = true;
        for (let s of demo.sites) {
            if (s.equals(tmp_p)) {
                unique = false;
                break;
            }
        }
        if (unique) {
            if (demo.renderMode == 'lava') {
                tmp_p.xv = Math.random() * 5;
                tmp_p.yv = Math.random() * 2;
                tmp_p.a = 1.0;
                demo.sites.push(tmp_p);
            } else {
                demo.sites.push(tmp_p);
                demo.runStatic();
            }
        }
        $('#num_points').html(' Num points: ' + demo.sites.length);
    }, false);
    c.addEventListener('mousemove', (e) => {
        if (!demo.trackCursor) {
            return;
        }
        // remove previous cursor point
        demo.sites = demo.sites.filter((site) => {
            return !('cursorPoint' in site);
        });
        let rect = c.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let tmp_p = new Point(x, y);
        let unique = true;
        for (let s of demo.sites) {
            if (s.equals(tmp_p)) {
                unique = false;
                break;
            }
        }
        if (unique) {
            // flag the point to remove next mouse movement
            tmp_p.cursorPoint = 'true';
            if (demo.renderMode == 'lava') {
                tmp_p.xv = 0;
                tmp_p.yv = 0;
                tmp_p.a = 0;
                demo.sites.push(tmp_p);
            } else {
                demo.sites.push(tmp_p);
                demo.runStatic();
            }
        }
    }, false);
    $delaunayCheckBox.on('change', () => {
        demo.renderStatic();
    });
    $voronoiCheckbox.on('change', () => {
        demo.renderStatic();
    });
    $('#track_cursor').on('change', () => {
        demo.trackCursor = $('#track_cursor').prop('checked');
        if (!demo.trackCursor) {
            // remove previous cursor point
            demo.sites = demo.sites.filter((site) => {
                return !('cursorPoint' in site);
            });
            if (demo.renderMode == 'static') {
                demo.runStatic();
            }
        }
    });
    demo.runStatic();
});
