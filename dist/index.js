"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var DIGIT = +('1e' + BIT);
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
    if (upto < -8 || upto > 100) {
        throw createError('precision should be between -8 to 100');
    }
};
function expToFixed(exp) {
    var _a = exp.split('e'), num = _a[0], e = _a[1];
    var pd = SafeFloatHelper.lengthBelowPoint(num);
    var p = +e - pd;
    num = num.replace('.', '');
    if (p === 0) {
        return num;
    }
    else if (p > 0) {
        return num + SafeFloatHelper.repeatZero(p);
    }
    else {
        if (-p >= num.length) {
            return '0.' + SafeFloatHelper.repeatZero(-num.length - p) + num;
        }
        else {
            return num.slice(0, p) + '.' + num.slice(p);
        }
    }
}
;
function comma(num) {
    var int = num.replace(/\.[^.]+$/, '');
    var decimal = num.replace(/^[^.]+/, '');
    return int.replace(/(\d)\B(?=(\d{3})+(?!\d))/g, '$1,') + decimal;
}
;
function calculate(n1, n2, op) {
    var x = SafeFloat.create(n1);
    var y = SafeFloat.create(n2);
    var sfX = x.safeFactor;
    var sfY = y.safeFactor;
    switch (op) {
        case '+':
            return plus(sfX, sfY);
        case '-':
            return minus(sfX, sfY);
        case '*':
            return mult(sfX, sfY);
        //case '/':
        // return new SafeFloat(div(sfX, sfY));
        default:
            throw createError('only +,-,*,/ are supported');
    }
}
function getInlineNumber(arr, start) {
    var fc;
    return arr[1] ? arr.reduce(function (str, unit) {
        var u = '' + unit;
        return str + SafeFloatHelper.repeatZero(BIT - u.length) + u;
    }, start) : (start + SafeFloatHelper.repeatZero(BIT - (fc = '' + arr[0]).length) + fc);
}
function increaseOne(str) {
    var overFlow = '';
    var i = str.length - 1;
    var addedNumber = '';
    for (; i >= 0; i--) {
        if (str[i] === '.') {
            addedNumber = '.' + addedNumber;
            continue;
        }
        addedNumber = STRING_PLUS_ONE[str[i]] + addedNumber;
        if (!(overFlow = addedNumber[0] === '0' ? '1' : '')) {
            break;
        }
    }
    return overFlow + str.slice(0, i) + addedNumber;
}
var mult = function (x, y) {
    var xi = x.i.slice();
    var yi = y.i.slice();
    var p = x.p + y.p;
    var sign = x.s * y.s;
    var newObj = [];
    for (var i = xi.length - 1; i >= 0; i--) {
        for (var j = yi.length - 1; j >= 0; j--) {
            var xk = xi[i];
            var yk = yi[j];
            newObj[i + j] = (newObj[i + j] || 0) + (xk * yk);
        }
    }
    return normalize(newObj, sign, p);
};
var dominoIncrease = function (i, p, s) {
    var overflow = 0;
    var c = [];
    for (var l = i.length - 1; l >= 0; l--) {
        var t = i[l] + overflow;
        if (t >= 0) {
            overflow = ~~(t / DIGIT);
        }
        else {
            overflow = -1;
            t += DIGIT;
        }
        c[l] = t % DIGIT;
    }
    if (overflow) {
        c.unshift(overflow);
        p += 1;
    }
    var hasExtra = true, str = '', expP, expI, exLen;
    for (var j = c.length - 1; j > 0; j--) {
        if (c[j] === 0 && hasExtra) {
            c.pop();
        }
        else {
            hasExtra = false;
            str = '' + c[j];
            expI = SafeFloatHelper.repeatZero(BIT - str.length) + str;
        }
    }
    expI = '' + c[0] + str;
    exLen = expI.length;
    expI = expI.replace(/0+$/, '');
    expP = BIT * (p - c.length + 1) + exLen - expI.length;
    return { i: c, p: p, s: s, exp: { expI: expI || '0', expP: expP } };
};
//  receive reversed array since calculate from the smallest digit
var normalize = function (i, s, p) {
    var SF = new SafeFloat('0');
    SF.safeFactor = dominoIncrease(i, p, s);
    return SF;
};
function plus(x, y) {
    if (x.s !== y.s) {
        switch (absCompare(x, y)) {
            case 1:
                return minus(x, __assign({}, y, { s: x.s }));
            case -1:
                return minus(y, __assign({}, x, { s: y.s }));
            default:
                return '0';
        }
    }
    else {
        var xi = x.i;
        var yi = y.i;
        var max = Math.max(x.p, y.p);
        var min = Math.min(x.p - xi.length + 1, y.p - yi.length + 1);
        var newObj = [];
        for (var i = max; i >= min; i--) {
            var xt = xi[x.p - i] || 0;
            var yt = yi[y.p - i] || 0;
            newObj[max - i] = xt + yt;
        }
        return normalize(newObj, x.s, max);
    }
}
;
function minus(x, y) {
    if (x.s !== y.s) {
        return plus(x, __assign({}, y, { s: x.s }));
    }
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
            return '0';
    }
    var bi = big.i;
    var si = small.i;
    var max = Math.max(big.p, small.p);
    var min = Math.min(big.p - bi.length + 1, small.p - si.length + 1);
    var newObj = [];
    for (var i = max; i >= min; i--) {
        var bt = bi[big.p - i] || 0;
        var st = si[small.p - i] || 0;
        newObj[max - i] = bt - st;
    }
    return normalize(newObj, s, max);
}
;
var div = function (x, y) {
};
function absCompare(a, b) {
    var bigger;
    if (a.p > b.p) {
        bigger = 1;
    }
    else if (a.p < b.p) {
        bigger = -1;
    }
    else {
        bigger = 0;
        var x = a.i;
        var y = b.i;
        var upto = Math.max(x.length, y.length);
        for (var i = 0; i < upto; i++) {
            var xi = x[i] || 0;
            var yi = y[i] || 0;
            if (xi > yi) {
                bigger = 1;
                break;
            }
            else if (xi < yi) {
                bigger = -1;
                break;
            }
        }
    }
    return bigger;
}
;
function keepPlaces(str, upto) {
    if (upto == null || upto <= 0) {
        return str;
    }
    var lengthBelowPoint = SafeFloatHelper.lengthBelowPoint(str);
    return str + (lengthBelowPoint > 0 ? '' : '.') + SafeFloatHelper.repeatZero(upto - lengthBelowPoint);
}
function neatPlaces(str) {
    return /\./.test(str) ? str.replace(/\.?0+$/, '') : str;
}
;
function decidePlaceHolder(str, upto, should) {
    if (should === void 0) { should = false; }
    return should ? neatPlaces(str) : keepPlaces(str, upto);
}
function safeExpToFixed(_a, s) {
    var expI = _a.expI, expP = _a.expP;
    var exp = expI[0] + (expI.length === 1 ? '' : expI.replace(/./, '.')) + 'e' + (expP < 0 ? '' : '+') + (expP + expI.length - 1);
    return (s < 0 ? '-' : '') + expToFixed(exp);
}
var SafeFloat = /** @class */ (function () {
    function SafeFloat(value, p) {
        if (p === void 0) { p = 0; }
        var num = '' + value;
        var m = /^([+-])?(\d+)?(\.(\d*))?(e([+-]?\d+))?$/.exec(num);
        if (!m || !/\d/.test(num)) {
            throw createError('received not number format including NaN  and Infinite number');
        }
        // m = [match, sign, int, dot+decimal, decimal, e[+-]precision, [+-]precision]
        var s, int, d;
        d = m[4] ? m[4] : '';
        int = (m[2] ? m[2].replace(/^0+/, '') || '0' : '0') + d;
        s = m[1] === '-' ? (int === '0' ? 1 : -1) : 1;
        p = -p + (m[6] ? +m[6] : 0) - d.length;
        // exponential form;
        var rest, str, start, end, cp;
        cp = p - (rest = (p < 0 ? BIT + (p % BIT) : p % BIT) % BIT);
        str = int + ZEROES[rest];
        start = 0;
        end = str.length % BIT || BIT;
        var piece;
        var ci = [];
        while (piece = str.slice(start, end)) {
            ci.push(+piece);
            start = end;
            end += BIT;
        }
        // firstly make p BIT's multiple and add extra digits from int
        // to make it exponential format
        // ex) [2][3] => [2].[3]
        cp = cp / BIT + (ci.length - 1);
        // intArr[0]. intArr[1-n] form;
        this.safeFactor = { i: ci, p: cp, s: s, exp: { expI: int, expP: p } };
    }
    Object.defineProperty(SafeFloat.prototype, "string", {
        get: function () {
            if (!this.safeFactor.string) {
                this.safeFactor.string = safeExpToFixed(this.safeFactor.exp, this.safeFactor.s);
            }
            return this.safeFactor.string;
        },
        enumerable: true,
        configurable: true
    });
    SafeFloat.prototype.isSafeFloat = function (a) {
        return a instanceof SafeFloat;
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
        return +this.handleRounding(upto, 1);
    };
    SafeFloat.prototype.round = function (upto) {
        return +this.handleRounding(upto, 0);
    };
    SafeFloat.prototype.floor = function (upto) {
        return +this.handleRounding(upto, -1);
    };
    SafeFloat.prototype.cut = function (upto) {
        return +this.handleRounding(upto, -2);
    };
    SafeFloat.prototype.ceilStr = function (upto, neat) {
        return decidePlaceHolder(this.handleRounding(upto, 1), upto, neat);
    };
    SafeFloat.prototype.roundStr = function (upto, neat) {
        return decidePlaceHolder(this.handleRounding(upto, 0), upto, neat);
    };
    SafeFloat.prototype.floorStr = function (upto, neat) {
        return decidePlaceHolder(this.handleRounding(upto, -1), upto, neat);
    };
    SafeFloat.prototype.cutStr = function (upto, neat) {
        return decidePlaceHolder(this.handleRounding(upto, -2), upto, neat);
    };
    SafeFloat.prototype.ceilMask = function (upto, neat) {
        return comma(decidePlaceHolder(this.handleRounding(upto, 1), upto, neat));
    };
    SafeFloat.prototype.roundMask = function (upto, neat) {
        return comma(decidePlaceHolder(this.handleRounding(upto, 0), upto, neat));
    };
    SafeFloat.prototype.floorMask = function (upto, neat) {
        return comma(decidePlaceHolder(this.handleRounding(upto, -1), upto, neat));
    };
    SafeFloat.prototype.cutMask = function (upto, neat) {
        return comma(decidePlaceHolder(this.handleRounding(upto, -2), upto, neat));
    };
    SafeFloat.prototype.toString = function (upto) {
        return keepPlaces(this.string, upto);
    };
    SafeFloat.prototype.mask = function (upto, neat) {
        if (neat === void 0) { neat = false; }
        var str = this.string;
        str = decidePlaceHolder(str, upto, neat);
        return comma(str);
    };
    SafeFloat.prototype.handleRounding = function (upto, rounding) {
        if (upto === void 0) { upto = 0; }
        if (rounding === void 0) { rounding = 0; }
        precisionRangeError(upto);
        // takes reversed exp number so mult -1 and exp that actually rounding happends
        var clue = (upto * -1) - 1;
        var _a = this.safeFactor.exp, expI = _a.expI, expP = _a.expP;
        // displayed exp disits on abs
        var _b = [expI.length + expP - 1, expP], es = _b[0], ee = _b[1];
        var s = this.safeFactor.s;
        // negative number takes opposite way to round make ceil always +1, floor ~~,
        rounding *= s;
        // rounding happens smalled digit than displayed
        if (clue < ee) {
            return safeExpToFixed(this.safeFactor.exp, s);
        }
        // rounding happens bigger digit than displayed
        if (clue > es) {
            if (rounding === 1 && expI[0] !== '0') {
                return (s < 0 ? '-' : '') + '1e' + (expP < 0 ? '' : '+') + expP;
            }
            else {
                return '0';
            }
        }
        var point = es - clue;
        var rest = expI.slice(point);
        var safe = expI.slice(0, point);
        var shouldIncrease = rounding === 1 || (rounding === 0 && (s > 0 && +rest[0] >= 5 || s < 0 && +rest[0] <= 5));
        if (shouldIncrease) {
            safe = increaseOne(safe);
        }
        return safeExpToFixed({ expI: safe, expP: expP + rest.length }, s);
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
    return SafeFloat;
}());
exports.SafeFloat = SafeFloat;
