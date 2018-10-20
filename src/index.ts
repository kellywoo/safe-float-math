export type SafeFloatAcceptableType = number | string | SafeFloat
export type RoundingType = 0 | 1 | -1
export type SignType = -1 | 1

const createError = (msg: string) => new Error (msg);
const precisionRangeError = (limitTo: number) => {
  if ( limitTo < 0 || limitTo > 100 ) {
    throw createError ('precision should be between 0 to 100')
  }
};

const lengthBelowPoint = (str: string): number => {
  let position = str.indexOf ('.');
  if ( position === -1 ) {
    return 0;
  }
  return str.length - position - 1
};

const addPoint = (str: string): string => {
  return /\./.test(str) ? '' : '.';
}

const getIntAndPrecision = (num: number, precision = 0): [ number, number, SignType ] => {
  let [ i, e ] = num.toExponential ().toString ().split ('e');
  let int, exp, sign: SignType = 1;
  let position = i.indexOf ('.');
  if ( i[ 0 ] === '-' ) {
    sign = -1;
    i = i.substring (1);
  }
  int = position !== -1 ? parseInt (i.replace ('.', '')) : parseInt (i);
  exp = position !== -1 ? +e - lengthBelowPoint (i) : parseInt (e);

  // return reversed precision
  // ex) 0.1 = 1, 10 = -1
  return [ int, precision - exp, sign ];
};

const convertToStrNumber = (int: number, precision: number, sign: SignType): string => {
  let str: string = '' + int;
  let signChar = sign === -1 ? '-' : '';
  if ( precision !== 0 ) {
    if ( precision > 0 ) {
      if ( str.length <= precision ) {
        str = '0.' + SafeFloat.repeatZero (precision - str.length) + str;
      } else {
        str = str.slice (0, -precision) + '.' + str.slice (str.length - precision);
      }
    } else {
      str += SafeFloat.repeatZero (Math.abs (precision));
    }
  }
  return signChar + str;
};


export class SafeFloat {
  value: any;

  constructor (num: any, precision: number = 0) {
    let _int: number = !SafeFloat.isNumber (num) ? parseFloat ((<string>num)) : num;
    if ( isNaN (_int) ) {
      throw createError ('arguments should be a number')
    }
    let [ int, exp, sign ] = getIntAndPrecision (_int, precision);
    let string = convertToStrNumber (int, exp, sign);
    let number = +string;

    this.value = {
      get precision (): number {
        return exp
      },
      get string (): string {
        return string
      },
      get number (): number {
        return number
      },
      get int (): number {
        return sign * int
      }
    }
  }

  static matchingPrecision (x: SafeFloat, y: SafeFloat) {
    let gap = x.value.precision - y.value.precision;
    let retX, retY;
    if ( gap >= 0 ) {
      retX = { int: x.value.int, precision: x.value.precision };
      retY = { int: y.value.int * Math.pow (10, gap), precision: x.value.precision };
    } else {
      retY = { int: y.value.int, precision: y.value.precision };
      retX = { int: x.value.int * Math.pow (10, -1 * gap), precision: y.value.precision };
    }
    return { x: retX, y: retY };
  }

  static calculate (n1: SafeFloatAcceptableType, n2: SafeFloatAcceptableType, op: string) {
    let x = SafeFloat.create (n1);
    let y = SafeFloat.create (n2);

    let o;
    switch ( op ) {
      case '+':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int + o.y.int, o.x.precision);
      case '-':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int - o.y.int, o.x.precision);
      case '*':
        return new SafeFloat (x.value.int * y.value.int, x.value.precision + y.value.precision);
      case '/':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int / o.y.int);
      default:
        throw createError ('only +,-,*,/ are supported')
    }
  }

  static create (a: SafeFloatAcceptableType) {
    if ( a instanceof SafeFloat ) {
      return a;
    } else if ( [ 'number', 'string' ].some ((v) => v === typeof a) ) {
      return new SafeFloat (<number>a);
    } else {
      throw createError ('wrong format: should be number of SafeFloat instance');
    }
  }

  static isNumber (n: any): boolean {
    return typeof n === 'number'
  }

  static repeatZero (n: number): string {
    return SafeFloat.strRepeat ('0', n);
  }

  static strRepeat (str: string, n: number): string {
    let rest = '';
    if ( n < 1 ) {
      return rest;
    }
    while ( n > 0 ) {
      if ( n > 1 ) {
        if ( n % 2 ) {
          rest += str
        }
        n = Math.floor (n / 2);
        str += str;
      } else {
        str = str + rest;
        --n;
      }
    }
    return str;
  }

  static mask (_num: any) {
    let num: string;
    num = SafeFloat.isNumber (_num) ? new SafeFloat (<number>_num).value.string : _num;
    const sign = num[ 0 ] === '-' ? '-' : '';
    const strArr = sign ? num.slice (1).split ('.') : num.split ('.');
    return sign + strArr[ 0 ].replace (/\B(?=(\d{3})+(?!\d))/g, ',') + (strArr[ 1 ] ? ('.' + strArr[ 1 ]) : '');
  }

  static plus (x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.calculate (x, y, '+');
  }

  static minus (x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.calculate (x, y, '-');
  }

  static mult (x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.calculate (x, y, '*');
  }

  static div (x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.calculate (x, y, '/');
  }

  static trimZero (str: string): string {
    return SafeFloat.hasPoint (str) ? str.replace (/(\.?)0*$/, '') : str;
  }

  static neat (str: string, should?: boolean): string {
    return should ? SafeFloat.trimZero (str) : str;
  }

  static hasPoint (str: string): boolean {
    return /\./.test (str);
  }

  static cut (str: string, limitTo: number) {
    precisionRangeError(limitTo);
    return (str + addPoint(str) + SafeFloat.repeatZero (limitTo)).replace (new RegExp (`(\\.\\d{${limitTo}})(\\d*$)`), '$1');
  }

  toNumber (): number {
    return this.value.number;
  }

  ceil (limitTo: number): number {
    precisionRangeError(limitTo);
    return +this.dealRounding (limitTo, 1)
  }

  round (limitTo: number): number {
    precisionRangeError(limitTo);
    return +this.dealRounding (limitTo, 0)
  }

  floor (limitTo: number): number {
    precisionRangeError(limitTo);
    return +this.dealRounding (limitTo, -1)
  }

  ceilStr (limitTo: number, neat?: boolean): string {
    return SafeFloat.neat (this.toFixed (limitTo, 1), neat);
  }

  roundStr (limitTo: number, neat?: boolean): string {
    return SafeFloat.neat (this.toFixed (limitTo, 0), neat);
  }

  floorStr (limitTo: number, neat?: boolean): string {
    return SafeFloat.neat (this.toFixed (limitTo, -1), neat);
  }

  toString (): string {
    return this.value.string;
  }

  cutStr (limitTo: number, neat?: boolean): string{
    return SafeFloat.neat (SafeFloat.cut(this.value.string, limitTo), neat);
  }

  cut (limitTo: number): number{
    return +SafeFloat.cut(this.value.string, limitTo);
  }

  mask (): string {
    return SafeFloat.mask (this.value.string);
  }


  toFixed (limitTo: number, rounding: RoundingType = 0, mask = false): string {
    precisionRangeError(limitTo);
    let value = this.dealRounding (limitTo, rounding);
    if (limitTo !== 0 ){
      value += ((SafeFloat.hasPoint(value)? '' : '.') + SafeFloat.repeatZero(limitTo - lengthBelowPoint(value)));
    }
    return mask ? SafeFloat.mask (value) : value;
  }

  private dealRounding (limitTo: number, rounding: RoundingType): string {
    let num: number;

    if ( limitTo === 0 ) {
      num = this.value.number;
    } else {
      num = parseFloat ((this.value.string + SafeFloat.repeatZero (limitTo)).replace (new RegExp (`(\\.)(\\d{${limitTo}})`), '$2$1'));
    }
    switch ( rounding ) {
      case 0:
        num = Math.round (num);
        break;
      case -1:
        num = Math.floor (num);
        break;
      case 1:
        num = Math.ceil (num);
        break;
    }
    return convertToStrNumber.apply(null, getIntAndPrecision (num, limitTo));
  }

  plus (x: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.plus (this, x);
  }

  minus (x: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.minus (this, x);
  }

  mult (x: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.mult (this, x);
  }

  div (x: SafeFloatAcceptableType): SafeFloat {
    return SafeFloat.div (this, x);
  }
}
