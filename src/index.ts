const createError = (msg: string) => new Error (msg);
type SafeFloatAcceptableType = number | string | SafeFloat

export class SafeFloat {
  value: any;

  constructor (int: any, precision: number = 0) {
    let _int:number, _string: string, _number: number, _sign:-1|1, _precision: number;
    _int = !SafeFloat.isNumber( int) ? parseFloat ((<string>int)) : int;
    if ( isNaN (_int) ) {
      throw createError ('arguments should be a number')
    }
    let [ strI, strP ] = _int.toExponential ().toString ().split ('e');
    let intI, intP;
// sign
    if ( strI[ 0 ] === '-' ) {
      _sign = -1;
      strI = strI.substring (1);
    } else {
      _sign = 1;
    }

    if ( strI.length > 2 ) {
      intI = +strI.replace ('.', '');
      intP = +strP - (strI.length - 2);
    } else {
      intI = +strI;
      intP = +strP;
    }

    _int = intI;
    _precision = precision - intP;
    _string = (_sign === 1 ? '' : '-') + this.convertToStrNumber (_int, _precision);
    _number = +_string;
    this.value = {
      get precision (): number {
        return _precision
      },
      get string (): string {
        return _string
      },
      get number (): number {
        return _number
      },
      get int ():number {
        return _sign * _int
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

  static calculate (n1:SafeFloatAcceptableType, n2:SafeFloatAcceptableType, op:string) {
    let x = SafeFloat.getPrecision (n1);
    let y = SafeFloat.getPrecision (n2);

    let o;
    switch ( op ) {
      case '+':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int + o.y.int, o.x.precision);
        break;
      case '-':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int - o.y.int, o.x.precision);
        break;
      case '*':
        return new SafeFloat (x.value.int * y.value.int, x.value.precision + y.value.precision);
        break;
      case '/':
        o = SafeFloat.matchingPrecision (x, y);
        return new SafeFloat (o.x.int / o.y.int);
      default:
        throw createError ('only +,-,*,/ are supported')
    }
  }

  static getPrecision (a: SafeFloatAcceptableType) {
    if ( a instanceof SafeFloat ) {
      return a;
    } else if ( [ 'number', 'string' ].some ((v) => v === typeof a) ) {
      return new SafeFloat (<number>a);
    } else {
      throw createError ('wrong format: should be number of SafeFloat instance');
    }
  }

  static isNumber (n: any):boolean{
    return typeof n === 'number'
  }

  static repeatZero (n: number) {
    return n === 0 ? '' : SafeFloat.strRepeat ('0', n);
  }

  static strRepeat (str: string, n: number) {
    let rest = '';
    while ( n > 0 ) {
      if ( n > 1 ) {
        if ( n % 2 ) {
          rest += str
        }
        n = Math.floor(n / 2);
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
    num = SafeFloat.isNumber (_num) ? new SafeFloat(<number>_num).value.string : _num;
    const sign = num[ 0 ] === '-' ? '-' : '';
    const strArr = sign ? num.slice (1).split ('.') : num.split ('.');
    return sign + strArr[ 0 ].replace (/\B(?=(\d{3})+(?!\d))/g, ',') + (strArr[ 1 ] ? ('.' + strArr[ 1 ]) : '');
  }

  private convertToStrNumber (int: number, precision: number): string {
    let str: string = '' + int;
    if ( precision === 0 ) {
      return str;
    }

    if ( precision > 0 ) {
      if ( str.length <= precision ) {
        return '0.' + SafeFloat.repeatZero (precision - str.length) + str;
      } else {
        return str.slice (0, -precision) + '.' + str.slice (str.length - precision);
      }
    } else {
      return str + SafeFloat.repeatZero (Math.abs (precision));
    }
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

  toNumber (): number {
    return this.value.number;
  }

  ceil (precision: number, isString?: boolean): string | number {
    return isString ? this.toFixed (precision, 1) : +this.toFixed (precision, 1)
  }

  round (precision: number, isString?: boolean): string | number {
    return isString ? this.toFixed (precision, 0) : +this.toFixed (precision, 0)
  }

  floor (precision: number, isString?: boolean): string | number {
    return isString ? this.toFixed (precision, -1) : +this.toFixed (precision, -1)
  }

  toString (): string {
    return this.value.string;
  }

  mask (): string {
    return SafeFloat.mask (this.value.string);
  }

  toFixed (precision: number, rounding: 0|1|-1 = 0, mask = false):string {
    if ( precision < 0 || precision > 100 ) {
      throw createError ('precision should be between 0 to 100')
    }
    return mask ? SafeFloat.mask (this.dealRounding(precision, rounding)) : this.dealRounding(precision, rounding);
  }

  private dealRounding(precision:number, rounding:number):string {
    let temp: string = '';
    switch ( rounding ) {
      case 0:
        temp = this.value.number.toFixed (precision);
        break;
      case -1:
        temp = this.value.number.toFixed (precision + 1).slice (0, -1);
        break;
      case 1:
        temp = '' + Math.ceil (+this.value.number.toFixed (precision + 1).replace (/(\.)(\d*)(\d$)/, '$2.$3'));
        temp = temp.slice (0, -1 * precision) + '.' + temp.slice (-1 * precision);
        break;
      default:

    }
    return temp;
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
