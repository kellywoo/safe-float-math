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
const DIGIT = 1e+8;
const STRING_PLUS_ONE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export type SafeFloatAcceptableType = number | string | SafeFloat
export type RoundingType = 0 | 1 | -1 | -2
export type SignType = -1 | 1

interface SafeFactor {
  i: string; // exponential format but without dot 1.2345e+12=> 12345
  string?: string;
  c?: {ci: number[], cp: number}
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
  if (upto < -50 || upto > 50) {
    throw createError('precision should be between -50 to 50')
  }
};

function expToFixed(exp: string): string {
  const m = /^([+-])?(\d+)(\.(\d*))?(e([+-]?\d+))$/.exec(exp);
  if (!m) {
    // no exp format
    return exp;
  }
  let d = m[4] || '', s = m[1] || '', str;
  let num = m[2] + d, p = +m[6] - d.length;

  if (p === 0) {
    str = num;
  } else if (p > 0) {
    str = num + SafeFloatHelper.repeatZero(p);
  } else {
    if (-p >= num.length) {
      str = '0.' + SafeFloatHelper.repeatZero(-num.length - p) + num;
    } else {
      str = num.slice(0, p) + '.' + num.slice(p);
    }
  }
  return s + str
};

function comma(num: string): string {
  let int = num.replace(/\.[^.]+$/, '');
  let decimal = num.replace(/^[^.]+/, '');
  return int.replace(/(\d)\B(?=(\d{3})+(?!\d))/g, '$1,') + decimal;
};

// ci: number array, cp: first index
function grouping(sf: SafeFactor) {
  let ep = getLastExp(sf);
  let overflow = (BIT + (ep % BIT)) % BIT;
  let int = sf.i + SafeFloatHelper.repeatZero(overflow);
  let start = 0, end = int.length % BIT || BIT, piece;
  let ci = [];
  while (piece = int.slice(start, end)) {
    ci.push(+piece);
    start = end;
    end += BIT;
  }
  let i = -1, cp;
  while (ci[++i] === 0) {
  }
  cp = Math.floor(sf.p / BIT);
  if (i > 0) {
    ci = ci.slice(i);
    cp -= i
  }
  return {ci, cp: cp}
}

function calculate(n1: SafeFloatAcceptableType, n2: SafeFloatAcceptableType, op: string) {
  let x = SafeFloat.create(n1);
  let y = SafeFloat.create(n2);

  const sfX: SafeFactor = x.safeFactor;
  const sfY: SafeFactor = y.safeFactor;

  if (!sfX.c) {
    sfX.c = grouping(sfX);
  }
  if (!sfY.c) {
    sfY.c = grouping(sfY);
  }

  let sf;
  switch (op) {
    case '+':
      if (sfX.s !== sfY.s) {
        sf = sfX.s > 0 ? minus(sfX, sfY) : minus(sfY, sfX);
      } else {
        sf = plus(sfX, sfY);
      }
      break;
    case '-':
      if (sfX.s != sfY.s) {
        sf = sfX.s > 0 ? plus(sfX, sfY) : plus(sfY, sfX);
      } else {
        sf = minus(sfX, sfY)
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
      throw createError('only +,-,*,/ are supported')
  }
  return safeFactorToSafeFloat(sf);
}

function isZero(sf: SafeFactor){
  return sf.i[0] === '0';
}

function getLastExp(sf: SafeFactor){
  return sf.p - sf.i.length + 1
}

function seperateByBit(str) {
  let start = 0;
  let end = str.length % BIT || BIT;
  const temp = [];
  let piece;
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

function mult(x: SafeFactor, y: SafeFactor): SafeFactor {
  const xi = x.c.ci;
  const yi = y.c.ci;
  const p = x.c.cp + y.c.cp;
  const s = x.s * y.s;
  const newObj = [];
  for (let i = xi.length - 1; i >= 0; i--) {
    for (let j = yi.length - 1; j >= 0; j--) {
      let xk = xi[i];
      let yk = yi[j];
      newObj[i + j] = (newObj[i + j] || 0) + (xk * yk);
    }
  }
  return normalize(newObj, s, p);
};

//  sign x, y are always same
function plus(x: SafeFactor, y: SafeFactor): SafeFactor {
  const xi = x.c.ci;// 0,-1 => 0 i-p
  const yi = y.c.ci; // 1,0, -1 => 10 i-p
  const max = Math.max(x.c.cp, y.c.cp);
  const min = Math.min(x.c.cp - xi.length + 1, y.c.cp - yi.length + 1);
  const newObj = [];
  for (let i = max; i >= min; i--) {
    let xt = xi[x.c.cp - i] || 0;
    let yt = yi[y.c.cp - i] || 0;
    newObj[max - i] = xt + yt;
  }
  return normalize(newObj, x.s, max);
};

// x is always + , y is always -
function minus(x: SafeFactor, y: SafeFactor): SafeFactor {
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
      // calculate will prepare zero for undefined;
      return undefined;
  }

  const bi = big.c.ci;
  const si = small.c.ci;
  const max = Math.max(big.c.cp, small.c.cp);
  const min = Math.min(big.c.cp - bi.length + 1, small.c.cp - si.length + 1);
  const newObj = [];
  for (let i = max; i >= min; i--) {
    let bt = bi[big.c.cp - i] || 0;
    let st = si[small.c.cp - i] || 0;
    newObj[max - i] = bt - st;

  }
  return normalize(newObj, s, max);
};

const div = (x: SafeFactor, y: SafeFactor) => {

}

const flattenGroup = ({arr, p, s}) => {
  let overflow = 0;
  for (let j = arr.length - 1; j >= 0; j--) {
    let t = arr[j] + overflow;
    if (t >= 0) {
      overflow = ~~(t / DIGIT);
    } else {
      overflow = -1;
      t += DIGIT;
    }
    arr[j] = t % DIGIT;
  }
  if (overflow) {
    arr.unshift(overflow);
    p += 1;
  }
  return {arr, p, s};
}

const normalize = (arr: number [], s: SignType, p: number): SafeFactor => {
  let flat = flattenGroup({arr, s, p});
  let i = '', fl;
  let len = flat.arr.length
  for (let j = 0; j < len; j++) {
    let str = '' + flat.arr[j];
    if (j > 0) {
      str = SafeFloatHelper.repeatZero(BIT - str.length) + str;
    } else {
      fl = str.length;
    }
    i += str;
  }
  i = i.replace(/0+$/, '');
  flat.p = (flat.p * BIT) + fl - 1;
  return {i, p: flat.p, s};
};


function absCompare(a: SafeFactor, b: SafeFactor): number {
  if (a.p > b.p) {
    return 1;
  } else if (a.p < b.p) {
    return -1;
  } else {
    if (a.i === b.i && a.p === b.p) {
      return 0;
    }
    const upto = a.i.length > b.i.length ? b.i.length : a.i.length;
    const x = +a.i.slice(0, upto);
    const y = +b.i.slice(0, upto);
    if (x > y) {
      return 1;
    } else if (y > x) {
      return -1
    } else {
      return upto === a.i.length ? 1 : -1;
    }
  }
};

function keepPlaces(str: string, upto?: number): string {
  if (upto <= 0 || upto == null) {
    return str;
  }
  let lengthBelowPoint = SafeFloatHelper.lengthBelowPoint(str);
  return str + (lengthBelowPoint > 0 ? '' : '.') + SafeFloatHelper.repeatZero(upto - lengthBelowPoint);
}

function safeFactorToFixed({i, p, s}): string {
  i = i[0]+ (i.length === 1 ? '' : i.replace(/0+$/, '').replace(/./, '.'));
  const exp = (s < 0 ? '-' : '')
    + i
    + 'e' + (p < 0 ? '' : '+') + p;
  return expToFixed(exp);
}

function safeFactorToSafeFloat(sf?: SafeFactor){
  const SF = new SafeFloat('0');
  if (sf) {
    SF.update({i:sf.i.replace(/(\d)0+$/, '$1') , p:sf.p, s:sf.s});
  }
  return SF;
}


export class SafeFloat {
  static MAX_NE = 12; // last negative exp for constructor
  public safeFactor: SafeFactor;

  public get string() {
    if (!this.safeFactor.string) {
      this.safeFactor.string = safeFactorToFixed(this.safeFactor)
    }
    return this.safeFactor.string;
  }

  isSafeFloat(a) {
    return a instanceof SafeFloat;
  }

  update(sf:SafeFactor){
    this.safeFactor = {i: sf.i.slice(0, sf.p + SafeFloat.MAX_NE), p:sf.p, s:sf.s};
  }

  constructor(value: any = '0', p: number = 0) {
    if (value === '0') {
      // to create empty instance easy for calculate
      this.update({i: '0', p: 0, s: 1});
    }
    let num = '' + value;

    let m = /^([+-])?([\d.]+)(?:[eE]([+-]?\d+))?$/.exec(num);
    if (!m || m.indexOf('.') !== m.lastIndexOf('.')) {
      throw createError('received not number format including NaN  and Infinite number: ' + value);
    }
    let len, int, t, j = 0;
    t = m[2];
    p = p * -1 + (+m[3] || 0);
    len = t.length;
    int = '0';

    for (; j < len; j++) {
      if (t[j] === '.') {
        break;
      } else {
        if (int === '0') {
          int = t[j]
        } else {
          int += t[j];
          p++;
        }
      }
    }
    for (++j; j < len; j++) {
      if(int ==='0') {
        // case for 0.1 => 1e-1
        p--;
        int = t[j];
      } else {
        int += t[j]
      }
    }

    int = int.replace(/0+$/, '') || (p = 0, '0');
    this.update({i: int, p, s : m[1] === '-' ? -1 : 1});
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

  static copy(config: {}){
    const c = {

    }
    return class extends SafeFloat {
      constructor(...args){
        super(...args);
      }
    }
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
    return +this.roundingStr(upto, 1)
  }

  round(upto: number): number {
    return +this.roundingStr(upto, 0)
  }

  floor(upto: number): number {
    return +this.roundingStr(upto, -1)
  }

  cut(upto: number): number {
    return +this.roundingStr(upto, -2);
  }

  ceilStr(upto: number, neat?: boolean): string {
    let str = this.roundingStr(upto, 1);
    return neat ? str : keepPlaces(str, upto);
  }

  roundStr(upto: number, neat?: boolean): string {
    let str = this.roundingStr(upto, 0);
    return neat ? str : keepPlaces(str, upto);
  }

  floorStr(upto: number, neat?: boolean): string {
    let str = this.roundingStr(upto, -1);
    console.log(str);
    return neat ? str : keepPlaces(str, upto);
  }

  cutStr(upto: number, neat?: boolean): string {
    let str = this.roundingStr(upto, 1 - 2);
    return neat ? str : keepPlaces(str, upto);
  }

  ceilMask(upto: number, neat?: boolean): string {
    return comma(this.ceilStr(upto, neat));
  }

  roundMask(upto: number, neat?: boolean): string {
    return comma(this.roundStr(upto, neat));
  }

  floorMask(upto: number, neat?: boolean): string {
    return comma(this.floorStr(upto, neat));
  }

  cutMask(upto: number, neat?: boolean): string {
    return comma(this.cutStr(upto, neat));
  }

  toString(upto: number = 0): string {
    return keepPlaces(this.string, upto);
  }

  toExp() {
    const {s, i, p} = this.safeFactor;
    return (s < 0 ? '-' : '')
      + (i[0] + (i.length === 1 ? '' : i.replace(/./, '.')))
      + 'e' + (p < 0 ? '' : '+') + p;
  }

  ceilSafe(upto: number): SafeFloat {
    return this.roundingSafeFloat(upto, 1);
  }

  roundSafe(upto: number): SafeFloat {
    return this.roundingSafeFloat(upto, 0);
  }

  floorSafe(upto: number): SafeFloat {
    return this.roundingSafeFloat(upto, -1);
  }

  cutSafe(upto: number): SafeFloat {
    return this.roundingSafeFloat(upto, -2);
  }

  mask(upto?: number, neat = false): string {
    let str = this.string;
    str = neat ? str : keepPlaces(str, upto);
    return comma(str);
  }

  roundingStr(upto: number = 0, rounding: RoundingType = 0): string {
    precisionRangeError(upto);
    // const {i, expP} = this.safeFactor.exp;
    // displayed exp disits on abs
    return safeFactorToFixed(this.handleRounding(upto, rounding));
  }

  roundingSafeFloat(upto: number = 0, rounding: RoundingType = 0): SafeFloat {
    precisionRangeError(upto);
    return safeFactorToSafeFloat(this.handleRounding(upto, rounding));
  }

  handleRounding(upto: number = 0, rounding: RoundingType = 0): SafeFactor {
    let {s, i, p} = this.safeFactor;
    const [es, ee] = [p, getLastExp(this.safeFactor)];
    // takes reversed exp number so mult -1 and exp that actually rounding happends
    const clue = (upto * -1) - 1;
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
        return {s, i: '1', p};
      } else {
        return {s: 1, i: '0', p: 0};
      }
    }

    // 3. the rest
    const point = es - clue;
    const rest = i.slice(point) || '';
    let safe = i.slice(0, point);
    let shouldIncrease = rounding === 1 || (rounding === 0 && (s > 0 && +rest[0] >= 5 || s < 0 && +rest[0] <= 5));
    if (shouldIncrease) {
      let overFlow, updated, mutated = '';
      let l = safe.length;
      while (l > 0) {
        mutated = (updated = STRING_PLUS_ONE[safe[--l]]) + mutated;
        if (!(overFlow = updated === '0' ? '1' : '')) {
          break;
        }
      }
      if (overFlow) {
        p++
      }
      safe = overFlow + safe.slice(0, l) + mutated;
    }

    console.log(s, safe, p)

    if (!safe) {
      console.log('hello')
      return {s: 1, i: '0', p: 0}
    } else {
      return {s, i: safe, p}
    }
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

  pow(n){
    let x = n;
    let j = [];
    while((x = (x >> 1)) > 1) {
      j.push()
    }

  }

  absCompare(x: SafeFloatAcceptableType) {
    const xs = SafeFloat.create(x);
    return absCompare(this.safeFactor, xs.safeFactor);
  }

  compare(x: SafeFloatAcceptableType) {
    const xs = SafeFloat.create(x);
    // different sign
    if (this.safeFactor.s > xs.safeFactor.s) {
      return 1;
    }
    if (this.safeFactor.s < xs.safeFactor.s) {
      return -1
    }
    // same sign
    if (this.safeFactor.s > 0) {
      return absCompare(this.safeFactor, xs.safeFactor);
    } else {
      return absCompare(xs.safeFactor, this.safeFactor);
    }
  }
}
