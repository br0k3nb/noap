export class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    equals({ x, y }) {
        return this.x === x && this.y === y;
    }

    calcDeltaXTo({ x }) {
        return this.x - x;
    }

    calcDeltaYTo({ y }) {
        return this.y - y;
    }

    calcHorizontalDistanceTo(point) {
        return Math.abs(this.calcDeltaXTo(point));
    }

    calcVerticalDistance(point) {
        return Math.abs(this.calcDeltaYTo(point));
    }

    calcDistanceTo(point) {
        return Math.sqrt(Math.pow(this.calcDeltaXTo(point), 2) +
            Math.pow(this.calcDeltaYTo(point), 2));
    }
}

export function isPoint(x) {
    return x instanceof Point;
}