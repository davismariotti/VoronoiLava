'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EPSILON = 0.000000001;

var Triangle = function () {
    function Triangle(p1, p2, p3) {
        _classCallCheck(this, Triangle);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        var circumcircle = this.circumcircle();
        this.edges = [new Edge(p1, p2), new Edge(p1, p3), new Edge(p2, p3)];
        this.center = circumcircle.center;
        this.rad = circumcircle.rad;
    }

    _createClass(Triangle, [{
        key: 'circumscribes',
        value: function circumscribes(pt) {
            return pt.distanceTo(this.center) < this.rad;
        }
    }, {
        key: 'containsPoint',
        value: function containsPoint(point) {
            return point.equals(this.p1) || point.equals(this.p2) || point.equals(this.p3);
        }
    }, {
        key: 'containsEdge',
        value: function containsEdge(edge) {
            return this.edges[0].equals(edge) || this.edges[1].equals(edge) || this.edges[2].equals(edge);
        }
    }, {
        key: 'sharesVertex',
        value: function sharesVertex(t) {
            return t.p1.equals(this.p1) || t.p1.equals(this.p2) || t.p1.equals(this.p3) || t.p2.equals(this.p1) || t.p2.equals(this.p2) || t.p2.equals(this.p3) || t.p3.equals(this.p1) || t.p3.equals(this.p2) || t.p3.equals(this.p3);
        }
    }, {
        key: 'sharesEdge',
        value: function sharesEdge(tri) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    e = _step.value;

                    if (tri.containsEdge(e)) {
                        return true;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return false;
        }
    }, {
        key: 'circumcircle',
        value: function circumcircle() {
            var x2copy = this.p2.x - this.p1.x;
            var y2copy = this.p2.y - this.p1.y;
            var x3copy = this.p3.x - this.p1.x;
            var y3copy = this.p3.y - this.p1.y;

            var b = x2copy * x2copy + y2copy * y2copy;
            var c = x3copy * x3copy + y3copy * y3copy;

            var d = x2copy * y3copy - y2copy * x3copy;

            var x = (y3copy * b - y2copy * c) * 0.5 / d;
            var y = (x2copy * c - x3copy * b) * 0.5 / d;

            return {
                center: new Point(this.p1.x + x, this.p1.y + y),
                rad: ((this.p1.x - this.p1.x + x) ** 2 + (this.p1.y - this.p1.y + y) ** 2) ** 0.5
            };
        }
    }]);

    return Triangle;
}();

var Point = function () {
    function Point(x, y) {
        _classCallCheck(this, Point);

        this.x = x;
        this.y = y;
    }

    _createClass(Point, [{
        key: 'equals',
        value: function equals(p) {
            return p.x == this.x && p.y == this.y;
            //return Math.abs(p.x - this.x) < EPSILON && Math.abs(p.y - this.y) < EPSILON;
        }
    }, {
        key: 'distanceTo',
        value: function distanceTo(pt) {
            return Math.sqrt(Math.pow(pt.x - this.x, 2) + Math.pow(pt.y - this.y, 2));
        }
    }]);

    return Point;
}();

var Edge = function () {
    function Edge(pt1, pt2) {
        _classCallCheck(this, Edge);

        this.pt1 = pt1;
        this.pt2 = pt2;
    }

    _createClass(Edge, [{
        key: 'equals',
        value: function equals(edge) {
            return edge.pt1.equals(this.pt1) && edge.pt2.equals(this.pt2) || edge.pt2.equals(this.pt1) && edge.pt1.equals(this.pt2);
        }
    }, {
        key: 'isUniqueIn',
        value: function isUniqueIn(edges) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _e = _step2.value;

                    if (_e == this) {
                        continue;
                    }
                    if (this.equals(_e)) return false;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return true;
        }
    }]);

    return Edge;
}();

var Voronoi = function () {
    function Voronoi(points) {
        _classCallCheck(this, Voronoi);

        this.points = points;
        this.triangles = [];
        this.superTriangles = [];
        this.superPoints = [];
        this._tris = [];
    }

    _createClass(Voronoi, [{
        key: 'generate',
        value: function generate() {
            this.superTriangles = this.generateSuperTriangles();

            for (var i = 0; i < this.points.length; i++) {
                this.addVertex(i);
            }

            this.removeSuperTriangles();
            //this.points = this.points.slice(0, this.points.length-4);

            var ptToTri = {};
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.triangles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var t = _step3.value;

                    ptToTri[t.pt1] = t;
                    ptToTri[t.pt2] = t;
                    ptToTri[t.pt3] = t;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var ptNeighbors = {};
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.points[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var pt = _step4.value;

                    var _triangles = ptToTri[pt];
                    var neighbors = new Set();
                    if (_triangles != null) {
                        for (var j = 0; j < _triangles.length; j++) {
                            var _t = _triangles[j];
                            if (_t.pt1 != pt) {
                                neighbors.add(_t.pt1);
                            }
                            if (_t.pt2 != pt) {
                                neighbors.add(_t.pt2);
                            }
                            if (_t.pt3 != pt) {
                                neighbors.add(_t.pt3);
                            }
                        }
                    }
                    ptNeighbors[pt] = neighbors;
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: 'addVertex',
        value: function addVertex(pIdx) {
            var pt = this.points[pIdx];
            //console.log('POINT' , pt);

            // Find all triangles containing pt in circumcircle
            var circTriangles = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.triangles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var tri = _step5.value;

                    //console.log('TRIANGLE', tri);
                    //console.log('CIRCUMSCRIBES', tri.circumscribes(pt));
                    if (tri.circumscribes(pt)) {
                        circTriangles.push(tri);
                    }
                }

                // Remove all triangles containing pt in circumcircle
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.triangles = this.triangles.filter(function (_tri) {
                return circTriangles.indexOf(_tri) == -1;
            });

            var edgeBuffer = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = circTriangles[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var t = _step6.value;

                    edgeBuffer.push(new Edge(t.p1, t.p2), new Edge(t.p2, t.p3), new Edge(t.p3, t.p1));
                }

                //console.log('edgeBuffer', edgeBuffer);
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            var uniqueEdges = [];
            for (var i = 0; i < edgeBuffer.length; i++) {
                if (edgeBuffer[i].isUniqueIn(edgeBuffer)) {
                    uniqueEdges.push(edgeBuffer[i]);
                }
            }

            //console.log('edgeBuffer UPDATED', edgeBuffer);

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = uniqueEdges[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _e2 = _step7.value;

                    this.triangles.push(new Triangle(pt, _e2.pt1, _e2.pt2));
                    this._tris.push(new Triangle(pt, _e2.pt1, _e2.pt2));
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    }, {
        key: 'generateSuperTriangles',
        value: function generateSuperTriangles() {
            var p1 = new Point(-0.1, -0.1);
            var p2 = new Point(C_WIDTH + 0.1, -0.1);
            var p3 = new Point(-0.1, C_HEIGHT + 0.1);
            var p4 = new Point(C_WIDTH + 0.1, C_HEIGHT + 0.1);

            this.points.push(p1, p2, p3, p4);
            this.superPoints.push(p1, p2, p3, p4);

            var t1 = new Triangle(p1, p2, p4);
            var t2 = new Triangle(p1, p3, p4);

            this.triangles.push(t1, t2);
            return [t1, t2];
        }
    }, {
        key: 'removeSuperTriangles',
        value: function removeSuperTriangles() {
            var mTriangles = [];
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this.triangles[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var tri = _step8.value;

                    var sharesVertex = false;
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = this.superTriangles[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var sTri = _step10.value;

                            if (sTri.sharesVertex(tri)) {
                                sharesVertex = true;
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError10 = true;
                        _iteratorError10 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                _iterator10.return();
                            }
                        } finally {
                            if (_didIteratorError10) {
                                throw _iteratorError10;
                            }
                        }
                    }

                    if (!sharesVertex) {
                        mTriangles.push(tri);
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            this.triangles = mTriangles;

            console.log(this.superPoints);
            console.log(this.points);
            var sPts = this.superPoints;
            this.points = this.points.filter(function (el) {
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = sPts[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var sPt = _step9.value;

                        if (sPt.equals(el)) {
                            return false;
                        }
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                return true;
            });
            console.log(this.points);
        }
    }, {
        key: 'getNeighbors',
        value: function getNeighbors(triangle) {
            var tris = [];
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = this.triangles[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var tri = _step11.value;

                    if (tri.sharesEdge(triange)) {
                        tris.push(tri);
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            return tris;
        }
    }, {
        key: 'draw',
        value: function draw(c) {
            console.log("draw", this.points);
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = this.points[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    var p = _step12.value;

                    c.drawArc({
                        strokeStyle: 'steelBlue',
                        strokeStyle: 'blue',
                        strokeWidth: 4,
                        x: p.x, y: p.y,
                        radius: 2
                    });
                }
            } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12.return) {
                        _iterator12.return();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
                    }
                }
            }

            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = this.triangles[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var tri = _step13.value;

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
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = this.triangles[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var triangle = _step14.value;

                    c.drawArc({
                        strokeStyle: 'red',
                        strokeWidth: 4,
                        x: triangle.center.x, y: triangle.center.y,
                        radius: 1
                    });
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                        _iterator14.return();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }

            for (var i = 0; i < this.triangles.length - 1; i++) {
                var t1 = this.triangles[i];
                var t2 = this.triangles[i + 1];
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
    }]);

    return Voronoi;
}();

var pNum = 10;
var C_WIDTH = 500;
var C_HEIGHT = 500;

$(function () {
    var points = [];

    // for (var i = 0; i < pNum; i++) {
    //   points.push(new Point(Math.random() * C_WIDTH, Math.random() * C_HEIGHT));
    // }
    //console.log(v);
    $("#canvas").click(function (event) {
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
            var v = new Voronoi(points);
            v.generate();
            v.draw($canvas);
        }
    });
});
