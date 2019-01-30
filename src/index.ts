const ZEROES = [
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
const BIT = 8;
const DIGIT = +('1e' + BIT);
const STRING_PLUS_ONE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export type SafeFloatAcceptableType = number | string | SafeFloat
export type RoundingType = 0 | 1 | -1 | -2
export type SignType = -1 | 1

interface SafeFactor {
  i: number[];
  exp: {expI: string, expP: number};
  string?: string;
  p: number;
  s: SignType;
}

export class SafeFloatHelper {
  static lengthBelowPoint(str: string): number {
    let position = str.indexOf('.');
    if (position === -1) {
      return 0;
    }
    return str.length - position - 1
  };

  static abs(n: number): number {
    return n < 0 ? -n : n;
  }

  static strRepeat(str: string, n: number): string {
    return new Array(n + 1).join(str);
  };

  static repeatZero(n: number): string {
    return n <= 0 ? '' : n <= 20 ? ZEROES[n] : SafeFloatHelper.strRepeat('0', n);
  }

  static isNumber(n: any): boolean {
    return typeof n === 'number' && !isNaN(n);
  }

  static isString(str: any): boolean {
    return typeof str === 'string';
  }

  static toString(str: any) {
    if (str instanceof SafeFloat) {
      return str.toString();
    } else {
      if (typeof str === 'string') {
        if (/e/.test(str)) {
          return expToFixed(str)
        } else {
          return str;
        }
      } else {
        return new SafeFloat(str).toString();
      }
    }
  }

  static comma(num: any): string {
    return comma(SafeFloatHelper.toString(num))
  }
}

const createError = (msg: string) => new Error(msg);

const precisionRangeError = (upto: number) => {
  if (upto < -8 || upto > 100) {
    throw createError('precision should be between -8 to 100')
  }
};

function expToFixed(exp: string): string {
  let [num, e] = exp.split('e');
  let pd = SafeFloatHelper.lengthBelowPoint(num);
  let p = +e - pd;
  num = num.replace('.', '');

  if (p === 0) {
    return num;
  } else if (p > 0) {
    return num + SafeFloatHelper.repeatZero(p);
  } else {
    if (-p >= num.length) {
      return '0.' + SafeFloatHelper.repeatZero(-num.length - p) + num;
    } else {
      return num.slice(0, p) + '.' + num.slice(p);
    }
  }
};

function comma(num: string): string {
  let int = num.replace(/\.[^.]+$/, '');
  let decimal = num.replace(/^[^.]+/, '');
  return int.replace(/(\d)\B(?=(\d{3})+(?!\d))/g, '$1,') + decimal;
};


function calculate(n1: SafeFloatAcceptableType, n2: SafeFloatAcceptableType, op: string) {
  let x = SafeFloat.create(n1);
  let y = SafeFloat.create(n2);

  const sfX: SafeFactor = x.safeFactor;
  const sfY: SafeFactor = y.safeFactor;

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
      throw createError('only +,-,*,/ are supported')
  }
}

function getInlineNumber(arr, start) {
  let fc;
  return arr[1] ? arr.reduce((str, unit) => {
    let u = '' + unit;
    return str + SafeFloatHelper.repeatZero(BIT - u.length) + u;
  }, start): (start + SafeFloatHelper.repeatZero(BIT - (fc =''+arr[0]).length) + fc);

}


function increaseOne(str) {
  let overFlow = '';
  let i = str.length - 1;
  let addedNumber = '';
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


const mult = (x: SafeFactor, y: SafeFactor) => {
  const xi = x.i.slice();
  const yi = y.i.slice();
  const p = x.p + y.p;
  const sign = x.s * y.s;
  const newObj = [];
  for (let i = xi.length -1; i >= 0; i--) {
    for (let j = yi.length -1; j >= 0; j--) {
      let xk = xi[i];
      let yk = yi[j];
      newObj[i + j] = (newObj[i + j] || 0) + (xk * yk);
    }
  }
  return normalize(newObj, sign, p);
};

const dominoIncrease = (i, p, s) => {
  let overflow = 0;
  const c = [];
  for(let l = i.length -1; l>=0; l--){
    let t = i[l] + overflow;
    if (t >= 0) {
      overflow = ~~(t / DIGIT);
    } else {
      overflow = -1;
      t += DIGIT;
    }
    c[l] = t % DIGIT;
  }

  if (overflow) {
    c.unshift(overflow);
    p += 1;
  }
  let hasExtra = true, str ='', expP, expI, exLen;
  for (let j = c.length -1; j > 0; j--) {
    if(c[j] === 0 && hasExtra) {
      c.pop();
    } else {
      hasExtra = false;
      str = '' + c[j];
      expI = SafeFloatHelper.repeatZero(BIT-str.length) + str;
    }
  }
  expI = ''+c[0] + str;
  exLen = expI.length;
  expI = expI.replace(/0+$/, '');
  expP = BIT * (p - c.length + 1) + exLen - expI.length;
  return {i:c, p, s, exp: {expI: expI || '0', expP}}
};

//  receive reversed array since calculate from the smallest digit
const normalize = (i: number [], s: SignType, p: number): SafeFloat => {
  let SF = new SafeFloat('0');
  SF.safeFactor = dominoIncrease(i, p, s);
  return SF;
};


function plus(x: SafeFactor, y: SafeFactor) {
  if (x.s !== y.s) {
    switch (absCompare(x, y)) {
      case 1:
        return minus(x, <SafeFactor>{...y, s: x.s});
      case -1:
        return minus(y, <SafeFactor>{...x, s: y.s});
      default:
        return '0';
    }
  } else {
    const xi = x.i;
    const yi = y.i;
    const max = Math.max(x.p, y.p);
    const min = Math.min(x.p - xi.length + 1, y.p - yi.length + 1);
    const newObj = [];
    for (let i = max; i >= min; i--) {
      let xt = xi[x.p - i] || 0;
      let yt = yi[y.p - i] || 0;
      newObj[ max - i] = xt + yt;
    }
    return normalize(newObj, x.s, max);
  }
};

function minus(x: SafeFactor, y: SafeFactor) {
  if (x.s !== y.s) {
    return plus(x, <SafeFactor>{...y, s: x.s});
  }
  let big, small, s: SignType = x.s;
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

  const bi = big.i;
  const si = small.i;
  const max = Math.max(big.p, small.p);
  const min = Math.min(big.p - bi.length + 1, small.p - si.length + 1);
  const newObj = [];
  for (let i = max; i >= min; i--) {
    let bt = bi[big.p - i] || 0;
    let st = si[small.p - i] || 0;
    newObj[max-i] = bt - st;
  }
  return normalize(newObj, s, max);
};

const div = (x: SafeFactor, y: SafeFactor) => {

}

function absCompare(a: SafeFactor, b: SafeFactor): number {
  let bigger;
  if (a.p > b.p) {
    bigger = 1;
  } else if (a.p < b.p) {
    bigger = -1;
  } else {
    bigger = 0;
    const x = a.i;
    const y = b.i;
    const upto = Math.max(x.length, y.length);
    for (let i = 0; i < upto; i++) {
      const xi = x[i] || 0;
      const yi = y[i] || 0;
      if (xi > yi) {
        bigger = 1;
        break;
      } else if (xi < yi) {
        bigger = -1;
        break;
      }
    }
  }
  return bigger;
};

function keepPlaces(str: string, upto?: number): string {
  if (upto == null || upto <= 0) {
    return str;
  }
  let lengthBelowPoint = SafeFloatHelper.lengthBelowPoint(str);
  return str + (lengthBelowPoint > 0 ? '' : '.') + SafeFloatHelper.repeatZero(upto - lengthBelowPoint);
}

function neatPlaces(str) {
  return /\./.test(str) ? str.replace(/\.?0+$/, '') : str;
};

function decidePlaceHolder(str: string, upto?: number, should = false): string {
  return should ? neatPlaces(str) : keepPlaces(str, upto);
}

function safeExpToFixed({expI, expP}, s): string {
  let exp = expI[0] + (expI.length === 1 ? '' : expI.replace(/./, '.')) + 'e' + (expP < 0 ? '' : '+') + (expP + expI.length - 1);
  return (s < 0 ? '-' : '') + expToFixed(exp);
}

export class SafeFloat {
  public safeFactor: SafeFactor;

  public get string() {
    if (!this.safeFactor.string) {
      this.safeFactor.string = safeExpToFixed(this.safeFactor.exp, this.safeFactor.s)
    }
    return this.safeFactor.string;
  }

  isSafeFloat(a) {
    return a instanceof SafeFloat;
  }

  constructor(value: any, p: number = 0) {
    let num = '' + value;

    let m = /^([+-])?(\d+)?(\.(\d*))?(e([+-]?\d+))?$/.exec(num);
    if (!m || !/\d/.test(num)) {
      throw createError('received not number format including NaN  and Infinite number');
    }

    // m = [match, sign, int, dot+decimal, decimal, e[+-]precision, [+-]precision]
    let s, int, d;

    d = m[4] ? m[4] : '';
    int = (m[2] ? m[2].replace(/^0+/, '') || '0' : '0') + d;
    s = m[1] === '-' ? (int === '0' ? 1 : -1) : 1;
    p = -p + (m[6] ? +m[6] : 0) - d.length;

    // exponential form;
    let rest, str, start, end, cp;
    cp = p - (rest = (p < 0 ? BIT + (p % BIT) : p % BIT) % BIT);
    str = int + ZEROES[rest];
    start = 0;
    end = str.length % BIT || BIT;
    let piece;
    const ci = [];
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
    this.safeFactor = {i: ci, p: cp, s, exp: {expI: int, expP: p}}
  }

  static create(a: SafeFloatAcceptableType) {
    if (a instanceof SafeFloat) {
      return a;
    } else {
      return new SafeFloat(a);
    }
  }

  static mask(_num: number | string): string {
    return SafeFloatHelper.comma(_num);
  }

  static plus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return calculate(x, y, '+');
  }

  static minus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return calculate(x, y, '-');
  }

  static mult(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return calculate(x, y, '*');
  }

  static div(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    if ((y instanceof SafeFloat && y.toNumber() !== 0) || (+y !== 0)) {
      return calculate(x, y, '/');
    } else {
      throw createError('you can\'t divide number by zero.');
    }
  }

  toNumber(): number {
    return +this.string;
  }

  ceil(upto: number): number {
    return +this.handleRounding(upto, 1)
  }

  round(upto: number): number {
    return +this.handleRounding(upto, 0)
  }

  floor(upto: number): number {
    return +this.handleRounding(upto, -1)
  }

  cut(upto: number): number {
    return +this.handleRounding(upto, -2);
  }

  ceilStr(upto: number, neat?: boolean): string {
    return decidePlaceHolder(this.handleRounding(upto, 1), upto, neat);
  }

  roundStr(upto: number, neat?: boolean): string {
    return decidePlaceHolder(this.handleRounding(upto, 0), upto, neat);
  }

  floorStr(upto: number, neat?: boolean): string {
    return decidePlaceHolder(this.handleRounding(upto, -1), upto, neat);
  }

  cutStr(upto: number, neat?: boolean): string {
    return decidePlaceHolder(this.handleRounding(upto, -2), upto, neat);
  }

  ceilMask(upto: number, neat?: boolean): string {
    return comma(decidePlaceHolder(this.handleRounding(upto, 1), upto, neat));
  }

  roundMask(upto: number, neat?: boolean): string {
    return comma(decidePlaceHolder(this.handleRounding(upto, 0), upto, neat));
  }

  floorMask(upto: number, neat?: boolean): string {
    return comma(decidePlaceHolder(this.handleRounding(upto, -1), upto, neat));
  }

  cutMask(upto: number, neat?: boolean): string {
    return comma(decidePlaceHolder(this.handleRounding(upto, -2), upto, neat));
  }

  toString(upto?: number): string {
    return keepPlaces(this.string, upto);
  }

  mask(upto?: number, neat = false): string {
    let str = this.string;
    str = decidePlaceHolder(str, upto, neat);
    return comma(str);
  }

  handleRounding(upto: number = 0, rounding: RoundingType = 0): string {
    precisionRangeError(upto);
    // takes reversed exp number so mult -1 and exp that actually rounding happends
    const clue = (upto * -1) - 1;
    const {expI, expP} = this.safeFactor.exp;
    // displayed exp disits on abs
    const [es, ee] = [expI.length + expP - 1, expP];
    const s = this.safeFactor.s;
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
      } else {
        return '0';
      }
    }
    const point = es - clue;
    const rest = expI.slice(point);
    let safe = expI.slice(0, point);
    let shouldIncrease = rounding === 1 || (rounding === 0 && (s > 0 && +rest[0] >= 5 || s < 0 && +rest[0] <= 5));
    if (shouldIncrease) {
      safe = increaseOne(safe);
    }
    return safeExpToFixed({expI: safe, expP: expP + rest.length}, s)
  }

  plus(x: SafeFloatAcceptableType): SafeFloat {
    return calculate(this, x, '+');
  }

  minus(x: SafeFloatAcceptableType): SafeFloat {
    return calculate(this, x, '-');
  }

  mult(x: SafeFloatAcceptableType): SafeFloat {
    return calculate(this, x, '*');
  }

  div(x: SafeFloatAcceptableType): SafeFloat {
    return calculate(this, x, '/');
  }
}
