'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Triangle = function () {
    function Triangle(p1, p2, p3) {
        _classCallCheck(this, Triangle);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        var circumcircle = this.circumcircle();
        this.center = circumcircle.center;
        this.rad = circumcircle.rad;
    }

    _createClass(Triangle, [{
        key: 'circumscribes',
        value: function circumscribes(pt) {
            return pt.distanceTo(this.center) < this.rad;
        }
    }, {
        key: 'shareVertex',
        value: function shareVertex(t) {
            return t.p1 == this.p1 || t.p1 == this.p2 || t.p1 == this.p3 || t.p2 == this.p1 || t.p2 == this.p2 || t.p2 == this.p3 || t.p3 == this.p1 || t.p3 == this.p2 || t.p3 == this.p3;
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var e = _step.value;

                    if (e == this) {
                        continue;
                    }
                    if (this.equals(e)) return false;
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
        this._tris = [];
    }

    _createClass(Voronoi, [{
        key: 'generate',
        value: function generate() {
            this.superTriangles = this.generateSuperTriangles();

            for (var i = 0; i < this.points.length; i++) {
                this.addVertex(i);
            }

            var mTriangles = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.triangles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var tri = _step2.value;

                    var sharesVertex = false;
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = this.superTriangles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var sTri = _step3.value;

                            if (sTri.shareVertex(tri)) {
                                sharesVertex = true;
                                break;
                            }
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

                    if (!sharesVertex) {
                        mTriangles.push(tri);
                    }
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

            this.triangles = mTriangles;
        }
    }, {
        key: 'addVertex',
        value: function addVertex(pIdx) {
            var pt = this.points[pIdx];
            console.log('POINT', pt);

            // Find all triangles containing pt in circumcircle
            var circTriangles = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.triangles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var tri = _step4.value;

                    console.log('TRIANGLE', tri);
                    console.log('CIRCUMSCRIBES', tri.circumscribes(pt));
                    if (tri.circumscribes(pt)) {
                        circTriangles.push(tri);
                    }
                }

                // Remove all triangles containing pt in circumcircle
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

            this.triangles = this.triangles.filter(function (_tri) {
                return circTriangles.indexOf(_tri) == -1;
            });

            var edgeBuffer = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = circTriangles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var t = _step5.value;

                    edgeBuffer.push(new Edge(t.p1, t.p2), new Edge(t.p2, t.p3), new Edge(t.p3, t.p1));
                }
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

            console.log('edgeBuffer', edgeBuffer);

            var uniqueEdges = [];
            for (var i = 0; i < edgeBuffer.length; i++) {
                if (edgeBuffer[i].isUniqueIn(edgeBuffer)) {
                    uniqueEdges.push(edgeBuffer[i]);
                }
            }

            console.log('edgeBuffer UPDATED', edgeBuffer);

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = uniqueEdges[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var e = _step6.value;

                    this.triangles.push(new Triangle(pt, e.pt1, e.pt2));
                    this._tris.push(new Triangle(pt, e.pt1, e.pt2));
                }
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
        }
    }, {
        key: 'generateSuperTriangles',
        value: function generateSuperTriangles() {
            var p1 = new Point(-0.1, -0.1);
            var p2 = new Point(C_WIDTH + 0.1, -0.1);
            var p3 = new Point(-0.1, C_HEIGHT + 0.1);
            var p4 = new Point(C_WIDTH + 0.1, C_HEIGHT + 0.1);

            this.points.push(p1, p2, p3, p4);

            var t1 = new Triangle(p1, p2, p4);
            var t2 = new Triangle(p1, p3, p4);

            this.triangles.push(t1, t2);

            return [t1, t2];
        }
    }]);

    return Voronoi;
}();

var pNum = 10;
var C_WIDTH = 500;
var C_HEIGHT = 500;

$(function () {
    var c = $("#canvas");
    var points = [];

    for (var i = 0; i < pNum; i++) {
        points.push(new Point(Math.random() * C_WIDTH, Math.random() * C_HEIGHT));
    }

    var v = new Voronoi(points);

    v.generate();
    console.log(v);

    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = v.points[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var _c$drawArc;

            var p = _step7.value;

            c.drawArc((_c$drawArc = {
                strokeStyle: 'steelBlue'
            }, _defineProperty(_c$drawArc, 'strokeStyle', 'blue'), _defineProperty(_c$drawArc, 'strokeWidth', 4), _defineProperty(_c$drawArc, 'x', p.x), _defineProperty(_c$drawArc, 'y', p.y), _defineProperty(_c$drawArc, 'radius', 2), _c$drawArc));
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

    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = v.triangles[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var tri = _step8.value;

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
});
