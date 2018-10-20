"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createError = function (msg) { return new Error(msg); };
var precisionRangeError = function (limitTo) {
    if (limitTo < 0 || limitTo > 100) {
        throw createError('precision should be between 0 to 100');
    }
};
var lengthBelowPoint = function (str) {
    var position = str.indexOf('.');
    if (position === -1) {
        return 0;
    }
    return str.length - position - 1;
};
var addPoint = function (str) {
    return /\./.test(str) ? '' : '.';
};
var getIntAndPrecision = function (num, precision) {
    if (precision === void 0) { precision = 0; }
    var _a = num.toExponential().toString().split('e'), i = _a[0], e = _a[1];
    var int, exp, sign = 1;
    var position = i.indexOf('.');
    if (i[0] === '-') {
        sign = -1;
        i = i.substring(1);
    }
    int = position !== -1 ? parseInt(i.replace('.', '')) : parseInt(i);
    exp = position !== -1 ? +e - lengthBelowPoint(i) : parseInt(e);
    // return reversed precision
    // ex) 0.1 = 1, 10 = -1
    return [int, precision - exp, sign];
};
var convertToStrNumber = function (int, precision, sign) {
    var str = '' + int;
    var signChar = sign === -1 ? '-' : '';
    if (precision !== 0) {
        if (precision > 0) {
            if (str.length <= precision) {
                str = '0.' + SafeFloat.repeatZero(precision - str.length) + str;
            }
            else {
                str = str.slice(0, -precision) + '.' + str.slice(str.length - precision);
            }
        }
        else {
            str += SafeFloat.repeatZero(Math.abs(precision));
        }
    }
    return signChar + str;
};
var SafeFloat = /** @class */ (function () {
    function SafeFloat(num, precision) {
        if (precision === void 0) { precision = 0; }
        var _int = !SafeFloat.isNumber(num) ? parseFloat(num) : num;
        if (isNaN(_int)) {
            throw createError('arguments should be a number');
        }
        var _a = getIntAndPrecision(_int, precision), int = _a[0], exp = _a[1], sign = _a[2];
        var string = convertToStrNumber(int, exp, sign);
        var number = +string;
        this.value = {
            get precision() {
                return exp;
            },
            get string() {
                return string;
            },
            get number() {
                return number;
            },
            get int() {
                return sign * int;
            }
        };
    }
    SafeFloat.matchingPrecision = function (x, y) {
        var gap = x.value.precision - y.value.precision;
        var retX, retY;
        if (gap >= 0) {
            retX = { int: x.value.int, precision: x.value.precision };
            retY = { int: y.value.int * Math.pow(10, gap), precision: x.value.precision };
        }
        else {
            retY = { int: y.value.int, precision: y.value.precision };
            retX = { int: x.value.int * Math.pow(10, -1 * gap), precision: y.value.precision };
        }
        return { x: retX, y: retY };
    };
    SafeFloat.calculate = function (n1, n2, op) {
        var x = SafeFloat.create(n1);
        var y = SafeFloat.create(n2);
        var o;
        switch (op) {
            case '+':
                o = SafeFloat.matchingPrecision(x, y);
                return new SafeFloat(o.x.int + o.y.int, o.x.precision);
            case '-':
                o = SafeFloat.matchingPrecision(x, y);
                return new SafeFloat(o.x.int - o.y.int, o.x.precision);
            case '*':
                return new SafeFloat(x.value.int * y.value.int, x.value.precision + y.value.precision);
            case '/':
                o = SafeFloat.matchingPrecision(x, y);
                return new SafeFloat(o.x.int / o.y.int);
            default:
                throw createError('only +,-,*,/ are supported');
        }
    };
    SafeFloat.create = function (a) {
        if (a instanceof SafeFloat) {
            return a;
        }
        else if (['number', 'string'].some(function (v) { return v === typeof a; })) {
            return new SafeFloat(a);
        }
        else {
            throw createError('wrong format: should be number of SafeFloat instance');
        }
    };
    SafeFloat.isNumber = function (n) {
        return typeof n === 'number';
    };
    SafeFloat.repeatZero = function (n) {
        return SafeFloat.strRepeat('0', n);
    };
    SafeFloat.strRepeat = function (str, n) {
        var rest = '';
        if (n < 1) {
            return rest;
        }
        while (n > 0) {
            if (n > 1) {
                if (n % 2) {
                    rest += str;
                }
                n = Math.floor(n / 2);
                str += str;
            }
            else {
                str = str + rest;
                --n;
            }
        }
        return str;
    };
    SafeFloat.mask = function (_num) {
        var num;
        num = SafeFloat.isNumber(_num) ? new SafeFloat(_num).value.string : _num;
        var sign = num[0] === '-' ? '-' : '';
        var strArr = sign ? num.slice(1).split('.') : num.split('.');
        return sign + strArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (strArr[1] ? ('.' + strArr[1]) : '');
    };
    SafeFloat.plus = function (x, y) {
        return SafeFloat.calculate(x, y, '+');
    };
    SafeFloat.minus = function (x, y) {
        return SafeFloat.calculate(x, y, '-');
    };
    SafeFloat.mult = function (x, y) {
        return SafeFloat.calculate(x, y, '*');
    };
    SafeFloat.div = function (x, y) {
        return SafeFloat.calculate(x, y, '/');
    };
    SafeFloat.trimZero = function (str) {
        return SafeFloat.hasPoint(str) ? str.replace(/(\.?)0*$/, '') : str;
    };
    SafeFloat.neat = function (str, should) {
        return should ? SafeFloat.trimZero(str) : str;
    };
    SafeFloat.hasPoint = function (str) {
        return /\./.test(str);
    };
    SafeFloat.cut = function (str, limitTo) {
        precisionRangeError(limitTo);
        return (str + addPoint(str) + SafeFloat.repeatZero(limitTo)).replace(new RegExp("(\\.\\d{" + limitTo + "})(\\d*$)"), '$1');
    };
    SafeFloat.prototype.toNumber = function () {
        return this.value.number;
    };
    SafeFloat.prototype.ceil = function (limitTo) {
        precisionRangeError(limitTo);
        return +this.dealRounding(limitTo, 1);
    };
    SafeFloat.prototype.round = function (limitTo) {
        precisionRangeError(limitTo);
        return +this.dealRounding(limitTo, 0);
    };
    SafeFloat.prototype.floor = function (limitTo) {
        precisionRangeError(limitTo);
        return +this.dealRounding(limitTo, -1);
    };
    SafeFloat.prototype.ceilStr = function (limitTo, neat) {
        return SafeFloat.neat(this.toFixed(limitTo, 1), neat);
    };
    SafeFloat.prototype.roundStr = function (limitTo, neat) {
        return SafeFloat.neat(this.toFixed(limitTo, 0), neat);
    };
    SafeFloat.prototype.floorStr = function (limitTo, neat) {
        return SafeFloat.neat(this.toFixed(limitTo, -1), neat);
    };
    SafeFloat.prototype.toString = function () {
        return this.value.string;
    };
    SafeFloat.prototype.cutStr = function (limitTo, neat) {
        return SafeFloat.neat(SafeFloat.cut(this.value.string, limitTo), neat);
    };
    SafeFloat.prototype.cut = function (limitTo) {
        return +SafeFloat.cut(this.value.string, limitTo);
    };
    SafeFloat.prototype.mask = function () {
        return SafeFloat.mask(this.value.string);
    };
    SafeFloat.prototype.toFixed = function (limitTo, rounding, mask) {
        if (rounding === void 0) { rounding = 0; }
        if (mask === void 0) { mask = false; }
        precisionRangeError(limitTo);
        var value = this.dealRounding(limitTo, rounding);
        if (limitTo !== 0) {
            value += ((SafeFloat.hasPoint(value) ? '' : '.') + SafeFloat.repeatZero(limitTo - lengthBelowPoint(value)));
        }
        return mask ? SafeFloat.mask(value) : value;
    };
    SafeFloat.prototype.dealRounding = function (limitTo, rounding) {
        var num;
        if (limitTo === 0) {
            num = this.value.number;
        }
        else {
            num = parseFloat((this.value.string + SafeFloat.repeatZero(limitTo)).replace(new RegExp("(\\.)(\\d{" + limitTo + "})"), '$2$1'));
        }
        switch (rounding) {
            case 0:
                num = Math.round(num);
                break;
            case -1:
                num = Math.floor(num);
                break;
            case 1:
                num = Math.ceil(num);
                break;
        }
        return convertToStrNumber.apply(null, getIntAndPrecision(num, limitTo));
    };
    SafeFloat.prototype.plus = function (x) {
        return SafeFloat.plus(this, x);
    };
    SafeFloat.prototype.minus = function (x) {
        return SafeFloat.minus(this, x);
    };
    SafeFloat.prototype.mult = function (x) {
        return SafeFloat.mult(this, x);
    };
    SafeFloat.prototype.div = function (x) {
        return SafeFloat.div(this, x);
    };
    return SafeFloat;
}());
exports.SafeFloat = SafeFloat;
