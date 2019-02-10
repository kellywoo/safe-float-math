"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ZEROES = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
];
// Number.MAX_SAFE_INTEGER support 16 digit and consider multiply, take half of it
var BIT = 8;
var DIGIT = 1e+8;
var STRING_PLUS_ONE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
var SafeFloatHelper = /** @class */ (function () {
    function SafeFloatHelper() {
    }
    SafeFloatHelper.lengthBelowPoint = function (str) {
        var position = str.indexOf('.');
        if (position === -1) {
            return 0;
        }
        return str.length - position - 1;
    };
    ;
    SafeFloatHelper.abs = function (n) {
        return n < 0 ? -n : n;
    };
    SafeFloatHelper.strRepeat = function (str, n) {
        return new Array(n + 1).join(str);
    };
    ;
    SafeFloatHelper.repeatZero = function (n) {
        return n <= 0 ? '' : n <= 20 ? ZEROES[n] : SafeFloatHelper.strRepeat('0', n);
    };
    SafeFloatHelper.isNumber = function (n) {
        return typeof n === 'number' && !isNaN(n);
    };
    SafeFloatHelper.isString = function (str) {
        return typeof str === 'string';
    };
    SafeFloatHelper.toString = function (str) {
        if (str instanceof SafeFloat) {
            return str.toString();
        }
        else {
            if (typeof str === 'string') {
                if (/e/.test(str)) {
                    return expToFixed(str);
                }
                else {
                    return str;
                }
            }
            else {
                return new SafeFloat(str).toString();
            }
        }
    };
    SafeFloatHelper.comma = function (num) {
        return comma(SafeFloatHelper.toString(num));
    };
    return SafeFloatHelper;
}());
exports.SafeFloatHelper = SafeFloatHelper;
var createError = function (msg) { return new Error(msg); };
var precisionRangeError = function (upto) {
    if (upto < -50 || upto > 50) {
        throw createError('precision should be between -50 to 50');
    }
};
function expToFixed(exp) {
    var m = /^([+-])?(\d+)(\.(\d*))?(e([+-]?\d+))$/.exec(exp);
    if (!m) {
        // no exp format
        return exp;
    }
    var d = m[4] || '', s = m[1] || '', str;
    var num = m[2] + d, p = +m[6] - d.length;
    if (p === 0) {
        str = num;
    }
    else if (p > 0) {
        str = num + SafeFloatHelper.repeatZero(p);
    }
    else {
        if (-p >= num.length) {
            str = '0.' + SafeFloatHelper.repeatZero(-num.length - p) + num;
        }
        else {
            str = num.slice(0, p) + '.' + num.slice(p);
        }
    }
    return s + str;
}
;
function comma(num) {
    var int = num.replace(/\.[^.]+$/, '');
    var decimal = num.replace(/^[^.]+/, '');
    return int.replace(/(\d)\B(?=(\d{3})+(?!\d))/g, '$1,') + decimal;
}
;
// ci: number array, cp: first index
function grouping(sf) {
    var ep = getLastExp(sf);
    var overflow = (BIT + (ep % BIT)) % BIT;
    var int = sf.i + SafeFloatHelper.repeatZero(overflow);
    var start = 0, end = int.length % BIT || BIT, piece;
    var ci = [];
    while (piece = int.slice(start, end)) {
        ci.push(+piece);
        start = end;
        end += BIT;
    }
    var i = -1, cp;
    while (ci[++i] === 0) {
    }
    cp = Math.floor(sf.p / BIT);
    if (i > 0) {
        ci = ci.slice(i);
        cp -= i;
    }
    return { ci: ci, cp: cp };
}
function calculate(n1, n2, op) {
    var x = SafeFloat.create(n1);
    var y = SafeFloat.create(n2);
    var sfX = x.safeFactor;
    var sfY = y.safeFactor;
    if (!sfX.c) {
        sfX.c = grouping(sfX);
    }
    if (!sfY.c) {
        sfY.c = grouping(sfY);
    }
    var sf;
    switch (op) {
        case '+':
            if (sfX.s !== sfY.s) {
                sf = sfX.s > 0 ? minus(sfX, sfY) : minus(sfY, sfX);
            }
            else {
                sf = plus(sfX, sfY);
            }
            break;
        case '-':
            if (sfX.s != sfY.s) {
                sf = sfX.s > 0 ? plus(sfX, sfY) : plus(sfY, sfX);
            }
            else {
                sf = minus(sfX, sfY);
            }
            break;
        case '*':
            if (!(isZero(sfX) && isZero(sfY))) {
                sf = mult(sfX, sfY);
            }
            break;
        //case '/':
        // return new SafeFloat(div(sfX, sfY));
        default:
            throw createError('only +,-,*,/ are supported');
    }
    return safeFactorToSafeFloat(sf);
}
function isZero(sf) {
    return sf.i[0] === '0';
}
function getLastExp(sf) {
    return sf.p - sf.i.length + 1;
}
function seperateByBit(str) {
    var start = 0;
    var end = str.length % BIT || BIT;
    var temp = [];
    var piece;
    while (piece = str.slice(start, end)) {
        temp.push(+piece);
        start = end;
        end += BIT;
    }
    return temp;
}
// function pow (x:SafeFactor, n): SafeFactor {
//   if (!x.c) {
//     x.c = grouping(x);
//   }
//
//   let i = n;
//   let arr = n
//   while((i=(i>>1) > 1)) {
//
//   }
//
//   const xi = x.c.ci;
//   const yi = x.c.ci;
//   const p = x.c.cp * 2;
//   const s = x.s * x.s;
//   const newObj = [];
//   for (let i = xi.length - 1; i >= 0; i--) {
//     for (let j = yi.length - 1; j >= 0; j--) {
//       let xk = xi[i];
//       let yk = yi[j];
//       newObj[i + j] = (newObj[i + j] || 0) + (xk * yk);
//     }
//   }
// }
function mult(x, y) {
    var xi = x.c.ci;
    var yi = y.c.ci;
    var p = x.c.cp + y.c.cp;
    var s = x.s * y.s;
    var newObj = [];
    for (var i = xi.length - 1; i >= 0; i--) {
        for (var j = yi.length - 1; j >= 0; j--) {
            var xk = xi[i];
            var yk = yi[j];
            newObj[i + j] = (newObj[i + j] || 0) + (xk * yk);
        }
    }
    return normalize(newObj, s, p);
}
;
//  sign x, y are always same
function plus(x, y) {
    var xi = x.c.ci; // 0,-1 => 0 i-p
    var yi = y.c.ci; // 1,0, -1 => 10 i-p
    var max = Math.max(x.c.cp, y.c.cp);
    var min = Math.min(x.c.cp - xi.length + 1, y.c.cp - yi.length + 1);
    var newObj = [];
    for (var i = max; i >= min; i--) {
        var xt = xi[x.c.cp - i] || 0;
        var yt = yi[y.c.cp - i] || 0;
        newObj[max - i] = xt + yt;
    }
    return normalize(newObj, x.s, max);
}
;
// x is always + , y is always -
function minus(x, y) {
    var big, small, s = x.s;
    switch (absCompare(x, y)) {
        case 1:
            big = x;
            small = y;
            break;
        case -1:
            big = y;
            small = x;
            s *= -1;
            break;
        default:
            // calculate will prepare zero for undefined;
            return undefined;
    }
    var bi = big.c.ci;
    var si = small.c.ci;
    var max = Math.max(big.c.cp, small.c.cp);
    var min = Math.min(big.c.cp - bi.length + 1, small.c.cp - si.length + 1);
    var newObj = [];
    for (var i = max; i >= min; i--) {
        var bt = bi[big.c.cp - i] || 0;
        var st = si[small.c.cp - i] || 0;
        newObj[max - i] = bt - st;
    }
    return normalize(newObj, s, max);
}
;
var div = function (x, y) {
};
var flattenGroup = function (_a) {
    var arr = _a.arr, p = _a.p, s = _a.s;
    var overflow = 0;
    for (var j = arr.length - 1; j >= 0; j--) {
        var t = arr[j] + overflow;
        if (t >= 0) {
            overflow = ~~(t / DIGIT);
        }
        else {
            overflow = -1;
            t += DIGIT;
        }
        arr[j] = t % DIGIT;
    }
    if (overflow) {
        arr.unshift(overflow);
        p += 1;
    }
    return { arr: arr, p: p, s: s };
};
var normalize = function (arr, s, p) {
    var flat = flattenGroup({ arr: arr, s: s, p: p });
    var i = '', fl;
    var len = flat.arr.length;
    for (var j = 0; j < len; j++) {
        var str = '' + flat.arr[j];
        if (j > 0) {
            str = SafeFloatHelper.repeatZero(BIT - str.length) + str;
        }
        else {
            fl = str.length;
        }
        i += str;
    }
    i = i.replace(/0+$/, '');
    flat.p = (flat.p * BIT) + fl - 1;
    return { i: i, p: flat.p, s: s };
};
function absCompare(a, b) {
    if (a.p > b.p) {
        return 1;
    }
    else if (a.p < b.p) {
        return -1;
    }
    else {
        if (a.i === b.i && a.p === b.p) {
            return 0;
        }
        var upto = a.i.length > b.i.length ? b.i.length : a.i.length;
        var x = +a.i.slice(0, upto);
        var y = +b.i.slice(0, upto);
        if (x > y) {
            return 1;
        }
        else if (y > x) {
            return -1;
        }
        else {
            return upto === a.i.length ? 1 : -1;
        }
    }
}
;
function keepPlaces(str, upto) {
    if (upto <= 0 || upto == null) {
        return str;
    }
    var lengthBelowPoint = SafeFloatHelper.lengthBelowPoint(str);
    return str + (lengthBelowPoint > 0 ? '' : '.') + SafeFloatHelper.repeatZero(upto - lengthBelowPoint);
}
function safeFactorToFixed(_a) {
    var i = _a.i, p = _a.p, s = _a.s;
    i = i[0] + (i.length === 1 ? '' : i.replace(/0+$/, '').replace(/./, '.'));
    var exp = (s < 0 ? '-' : '')
        + i
        + 'e' + (p < 0 ? '' : '+') + p;
    return expToFixed(exp);
}
function safeFactorToSafeFloat(sf) {
    var SF = new SafeFloat('0');
    if (sf) {
        SF.update({ i: sf.i.replace(/(\d)0+$/, '$1'), p: sf.p, s: sf.s });
    }
    return SF;
}
var SafeFloat = /** @class */ (function () {
    function SafeFloat(value, p) {
        if (value === void 0) { value = '0'; }
        if (p === void 0) { p = 0; }
        if (value === '0') {
            // to create empty instance easy for calculate
            this.update({ i: '0', p: 0, s: 1 });
        }
        var num = '' + value;
        var m = /^([+-])?([\d.]+)(?:[eE]([+-]?\d+))?$/.exec(num);
        if (!m || m.indexOf('.') !== m.lastIndexOf('.')) {
            throw createError('received not number format including NaN  and Infinite number: ' + value);
        }
        var len, int, t, j = 0;
        t = m[2];
        p = p * -1 + (+m[3] || 0);
        len = t.length;
        int = '0';
        for (; j < len; j++) {
            if (t[j] === '.') {
                break;
            }
            else {
                if (int === '0') {
                    int = t[j];
                }
                else {
                    int += t[j];
                    p++;
                }
            }
        }
        for (++j; j < len; j++) {
            if (int === '0') {
                // case for 0.1 => 1e-1
                p--;
                int = t[j];
            }
            else {
                int += t[j];
            }
        }
        int = int.replace(/0+$/, '') || (p = 0, '0');
        this.update({ i: int, p: p, s: m[1] === '-' ? -1 : 1 });
    }
    Object.defineProperty(SafeFloat.prototype, "string", {
        get: function () {
            if (!this.safeFactor.string) {
                this.safeFactor.string = safeFactorToFixed(this.safeFactor);
            }
            return this.safeFactor.string;
        },
        enumerable: true,
        configurable: true
    });
    SafeFloat.prototype.isSafeFloat = function (a) {
        return a instanceof SafeFloat;
    };
    SafeFloat.prototype.update = function (sf) {
        this.safeFactor = { i: sf.i.slice(0, sf.p + SafeFloat.MAX_NE), p: sf.p, s: sf.s };
    };
    SafeFloat.create = function (a) {
        if (a instanceof SafeFloat) {
            return a;
        }
        else {
            return new SafeFloat(a);
        }
    };
    SafeFloat.mask = function (_num) {
        return SafeFloatHelper.comma(_num);
    };
    SafeFloat.plus = function (x, y) {
        return calculate(x, y, '+');
    };
    SafeFloat.minus = function (x, y) {
        return calculate(x, y, '-');
    };
    SafeFloat.mult = function (x, y) {
        return calculate(x, y, '*');
    };
    SafeFloat.copy = function (config) {
        var c = {};
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _super.apply(this, args) || this;
            }
            return class_1;
        }(SafeFloat));
    };
    SafeFloat.div = function (x, y) {
        if ((y instanceof SafeFloat && y.toNumber() !== 0) || (+y !== 0)) {
            return calculate(x, y, '/');
        }
        else {
            throw createError('you can\'t divide number by zero.');
        }
    };
    SafeFloat.prototype.toNumber = function () {
        return +this.string;
    };
    SafeFloat.prototype.ceil = function (upto) {
        return +this.roundingStr(upto, 1);
    };
    SafeFloat.prototype.round = function (upto) {
        return +this.roundingStr(upto, 0);
    };
    SafeFloat.prototype.floor = function (upto) {
        return +this.roundingStr(upto, -1);
    };
    SafeFloat.prototype.cut = function (upto) {
        return +this.roundingStr(upto, -2);
    };
    SafeFloat.prototype.ceilStr = function (upto, neat) {
        var str = this.roundingStr(upto, 1);
        return neat ? str : keepPlaces(str, upto);
    };
    SafeFloat.prototype.roundStr = function (upto, neat) {
        var str = this.roundingStr(upto, 0);
        return neat ? str : keepPlaces(str, upto);
    };
    SafeFloat.prototype.floorStr = function (upto, neat) {
        var str = this.roundingStr(upto, -1);
        console.log(str);
        return neat ? str : keepPlaces(str, upto);
    };
    SafeFloat.prototype.cutStr = function (upto, neat) {
        var str = this.roundingStr(upto, 1 - 2);
        return neat ? str : keepPlaces(str, upto);
    };
    SafeFloat.prototype.ceilMask = function (upto, neat) {
        return comma(this.ceilStr(upto, neat));
    };
    SafeFloat.prototype.roundMask = function (upto, neat) {
        return comma(this.roundStr(upto, neat));
    };
    SafeFloat.prototype.floorMask = function (upto, neat) {
        return comma(this.floorStr(upto, neat));
    };
    SafeFloat.prototype.cutMask = function (upto, neat) {
        return comma(this.cutStr(upto, neat));
    };
    SafeFloat.prototype.toString = function (upto) {
        if (upto === void 0) { upto = 0; }
        return keepPlaces(this.string, upto);
    };
    SafeFloat.prototype.toExp = function () {
        var _a = this.safeFactor, s = _a.s, i = _a.i, p = _a.p;
        return (s < 0 ? '-' : '')
            + (i[0] + (i.length === 1 ? '' : i.replace(/./, '.')))
            + 'e' + (p < 0 ? '' : '+') + p;
    };
    SafeFloat.prototype.ceilSafe = function (upto) {
        return this.roundingSafeFloat(upto, 1);
    };
    SafeFloat.prototype.roundSafe = function (upto) {
        return this.roundingSafeFloat(upto, 0);
    };
    SafeFloat.prototype.floorSafe = function (upto) {
        return this.roundingSafeFloat(upto, -1);
    };
    SafeFloat.prototype.cutSafe = function (upto) {
        return this.roundingSafeFloat(upto, -2);
    };
    SafeFloat.prototype.mask = function (upto, neat) {
        if (neat === void 0) { neat = false; }
        var str = this.string;
        str = neat ? str : keepPlaces(str, upto);
        return comma(str);
    };
    SafeFloat.prototype.roundingStr = function (upto, rounding) {
        if (upto === void 0) { upto = 0; }
        if (rounding === void 0) { rounding = 0; }
        precisionRangeError(upto);
        // const {i, expP} = this.safeFactor.exp;
        // displayed exp disits on abs
        return safeFactorToFixed(this.handleRounding(upto, rounding));
    };
    SafeFloat.prototype.roundingSafeFloat = function (upto, rounding) {
        if (upto === void 0) { upto = 0; }
        if (rounding === void 0) { rounding = 0; }
        precisionRangeError(upto);
        return safeFactorToSafeFloat(this.handleRounding(upto, rounding));
    };
    SafeFloat.prototype.handleRounding = function (upto, rounding) {
        if (upto === void 0) { upto = 0; }
        if (rounding === void 0) { rounding = 0; }
        var _a = this.safeFactor, s = _a.s, i = _a.i, p = _a.p;
        var _b = [p, getLastExp(this.safeFactor)], es = _b[0], ee = _b[1];
        // takes reversed exp number so mult -1 and exp that actually rounding happends
        var clue = (upto * -1) - 1;
        // negative number takes opposite way to round make ceil always +1, floor ~~,
        rounding *= s;
        // 1. rounding happens smalled digit than displayed
        if (clue < ee) {
            return this.safeFactor;
        }
        // 2. rounding happens bigger digit than displayed
        if (clue > es) {
            if (rounding === 1 && i[0] !== '0') {
                p += 1;
                return { s: s, i: '1', p: p };
            }
            else {
                return { s: 1, i: '0', p: 0 };
            }
        }
        // 3. the rest
        var point = es - clue;
        var rest = i.slice(point) || '';
        var safe = i.slice(0, point);
        var shouldIncrease = rounding === 1 || (rounding === 0 && (s > 0 && +rest[0] >= 5 || s < 0 && +rest[0] <= 5));
        if (shouldIncrease) {
            var overFlow = void 0, updated = void 0, mutated = '';
            var l = safe.length;
            while (l > 0) {
                mutated = (updated = STRING_PLUS_ONE[safe[--l]]) + mutated;
                if (!(overFlow = updated === '0' ? '1' : '')) {
                    break;
                }
            }
            if (overFlow) {
                p++;
            }
            safe = overFlow + safe.slice(0, l) + mutated;
        }
        console.log(s, safe, p);
        if (!safe) {
            console.log('hello');
            return { s: 1, i: '0', p: 0 };
        }
        else {
            return { s: s, i: safe, p: p };
        }
    };
    SafeFloat.prototype.plus = function (x) {
        return calculate(this, x, '+');
    };
    SafeFloat.prototype.minus = function (x) {
        return calculate(this, x, '-');
    };
    SafeFloat.prototype.mult = function (x) {
        return calculate(this, x, '*');
    };
    SafeFloat.prototype.div = function (x) {
        return calculate(this, x, '/');
    };
    SafeFloat.prototype.pow = function (n) {
        var x = n;
        var j = [];
        while ((x = (x >> 1)) > 1) {
            j.push();
        }
    };
    SafeFloat.prototype.absCompare = function (x) {
        var xs = SafeFloat.create(x);
        return absCompare(this.safeFactor, xs.safeFactor);
    };
    SafeFloat.prototype.compare = function (x) {
        var xs = SafeFloat.create(x);
        // different sign
        if (this.safeFactor.s > xs.safeFactor.s) {
            return 1;
        }
        if (this.safeFactor.s < xs.safeFactor.s) {
            return -1;
        }
        // same sign
        if (this.safeFactor.s > 0) {
            return absCompare(this.safeFactor, xs.safeFactor);
        }
        else {
            return absCompare(xs.safeFactor, this.safeFactor);
        }
    };
    SafeFloat.MAX_NE = 12; // last negative exp for constructor
    return SafeFloat;
}());
exports.SafeFloat = SafeFloat;
