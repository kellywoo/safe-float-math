"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createError = function (msg) { return new Error(msg); };
var SafeFloat = /** @class */ (function () {
    function SafeFloat(int, precision) {
        if (precision === void 0) { precision = 0; }
        var _int, _string, _number, _sign, _precision;
        _int = !SafeFloat.isNumber(int) ? parseFloat(int) : int;
        if (isNaN(_int)) {
            throw createError('arguments should be a number');
        }
        var _a = _int.toExponential().toString().split('e'), strI = _a[0], strP = _a[1];
        var intI, intP;
        // sign
        if (strI[0] === '-') {
            _sign = -1;
            strI = strI.substring(1);
        }
        else {
            _sign = 1;
        }
        if (strI.length > 2) {
            intI = +strI.replace('.', '');
            intP = +strP - (strI.length - 2);
        }
        else {
            intI = +strI;
            intP = +strP;
        }
        _int = intI;
        _precision = precision - intP;
        _string = (_sign === 1 ? '' : '-') + this.convertToStrNumber(_int, _precision);
        _number = +_string;
        this.value = {
            get precision() {
                return _precision;
            },
            get string() {
                return _string;
            },
            get number() {
                return _number;
            },
            get int() {
                return _sign * _int;
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
    SafeFloat.prototype.convertToStrNumber = function (int, precision) {
        var str = '' + int;
        if (precision === 0) {
            return str;
        }
        if (precision > 0) {
            if (str.length <= precision) {
                return '0.' + SafeFloat.repeatZero(precision - str.length) + str;
            }
            else {
                return str.slice(0, -precision) + '.' + str.slice(str.length - precision);
            }
        }
        else {
            return str + SafeFloat.repeatZero(Math.abs(precision));
        }
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
    SafeFloat.hasPoint = function (str) {
        return /\./.test(str);
    };
    SafeFloat.prototype.toNumber = function () {
        return this.value.number;
    };
    SafeFloat.prototype.ceil = function (precision) {
        return +this.toFixed(precision, 1);
    };
    SafeFloat.prototype.round = function (precision) {
        return +this.toFixed(precision, 0);
    };
    SafeFloat.prototype.floor = function (precision) {
        return +this.toFixed(precision, -1);
    };
    SafeFloat.prototype.ceilStr = function (precision) {
        return this.toFixed(precision, 1);
    };
    SafeFloat.prototype.roundStr = function (precision) {
        return this.toFixed(precision, 0);
    };
    SafeFloat.prototype.floorStr = function (precision) {
        return this.toFixed(precision, -1);
    };
    SafeFloat.prototype.toString = function () {
        return this.value.string;
    };
    SafeFloat.prototype.mask = function () {
        return SafeFloat.mask(this.value.string);
    };
    SafeFloat.prototype.toFixed = function (precision, rounding, mask) {
        if (rounding === void 0) { rounding = 0; }
        if (mask === void 0) { mask = false; }
        if (precision < 0 || precision > 100) {
            throw createError('precision should be between 0 to 100');
        }
        return mask ? SafeFloat.mask(this.dealRounding(precision, rounding)) : this.dealRounding(precision, rounding);
    };
    SafeFloat.prototype.dealRounding = function (precision, rounding) {
        var num = this.value.string + (SafeFloat.hasPoint(this.value.string) ? '' : '.') + SafeFloat.repeatZero(precision);
        num = +num.replace(new RegExp("(\\.)(\\d{" + precision + "})"), '$2$1');
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
        return this.convertToStrNumber(num, precision);
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
