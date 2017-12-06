"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Triangle = function () {
    function Triangle(p1, p2, p3) {
        _classCallCheck(this, Triangle);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    _createClass(Triangle, [{
        key: "circumcenter",
        value: function circumcenter() {
            this.p2.x -= this.p1.x;
            this.p2.y -= this.p1.y;
            this.p3.x -= this.p1.x;
            this.p3.y -= this.p1.y;

            var b = this.p2.x * this.p2.x + this.p2.y * this.p2.y;
            var c = this.p3.x * this.p3.x + this.p3.y * this.p3.y;

            var d = this.p2.x * this.p3.y - this.p2.y * this.p3.x;

            var x = (this.p3.y * b - this.p2.y * c) * 0.5 / d;
            var y = (this.p2.x * c - this.p3.x * b) * 0.5 / d;

            return {
                x: this.p1.x + x,
                y: this.p1.y + y
            };
        }
    }]);

    return Triangle;
}();

var Point = function Point(x, y) {
    _classCallCheck(this, Point);

    this.x = x;
    this.y = y;
};
