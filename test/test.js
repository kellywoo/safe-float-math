'use strict';
const {SafeFloat} = require('../dist/index.js');
const num = 31110.499925;
const sf = new SafeFloat(num);

describe('safeFloat constructor', () => {
  it('new constructor with number Works', () => {
    expect(new SafeFloat(0.00000000000001))
      .toBeInstanceOf(SafeFloat)
  });
  it('new constructor with string Works', () => {
    expect(new SafeFloat('0.00000000000001'))
      .toBeInstanceOf(SafeFloat)
  });
  // it('new constructor with wrong format number throws error', () => {
  //   expect(new SafeFloat('0.00000000.000001'))
  //     .toThrowError(/received not number type or Infinite number/)
  // });
  it('constructor Works with create', () => {
    expect(SafeFloat.create('0.00000000000001'))
      .toBeInstanceOf(SafeFloat);
  });
});

describe('safeFloat toString, toNumber', () => {
  it('toString Works', () => {
    expect(sf.toString())
      .toEqual('31110.499925');
  });
  it('toNumber Works', () => {
    expect(sf.toNumber())
      .toEqual(num);
  });

  it('should return new SafeFloat(0.123456, 6).toString() => 0.000000123456', () => {
    expect(new SafeFloat(0.123456, 6).toString())
      .toEqual('0.000000123456');
  });

  it('should return new SafeFloat(0.123456).toString(2) => 0.123456', () => {
    expect(new SafeFloat(0.123456).toString(2))
      .toEqual('0.123456');
  });

  it('should return new SafeFloat(0.123456).toString(9) => 0.123456000', () => {
    expect(new SafeFloat(0.123456).toString(9))
      .toEqual('0.123456000');
  });

  it('should return new SafeFloat(123456).toString(3) => 123456.000', () => {
    expect(new SafeFloat(123456).toString(3))
      .toEqual('123456.000');
  });

  it(`should return new SafeFloat(-8.87).plus(-7.1).toString() => -15.97`, () => {
    expect(new SafeFloat(-8.87).plus(-7.1).toString())
      .toEqual('-15.97');
  });
})

describe('safeFloat calculate', () => {
  it('should return SafeFloat.plus(0.1, 0.2) => 0.3', () => {
    expect(SafeFloat.plus(0.1, 0.2).toNumber())
      .toEqual(0.3);

    expect(SafeFloat.plus(0.1, 0.2).toString())
      .toEqual('0.3');
  });

  it('should return 15.97', () => {
    expect(new SafeFloat(8.87).plus(7.1).toNumber())
      .toEqual(15.97);

    expect(new SafeFloat(8.87).plus(7.1).toString())
      .toEqual('15.97');
  });

  it(`should return new SafeFloat(10000000).mult(1000000000).floorStr(8)=> 10000000000000000.00000000`, () => {
    expect(new SafeFloat(10000000).mult(1000000000).toString())
      .toEqual('10000000000000000');
  });
});

describe('safeFloat rounding', () => {
  it(`should return round => 31110.49993`, () => {
    expect(sf.round(5))
      .toEqual(31110.49993);
  });

  it(`should return ceil => 31110.49993`, () => {
    expect(sf.ceil(5))
      .toEqual(31110.49993);
  });

  it(`should return new SafeFloat(2.9999).floor(3) => 2.999`, () => {
    expect(new SafeFloat(2.9999).floor(3))
      .toEqual(2.999);
  });

  it(`should return new SafeFloat(-2.9999).floor(3) => -3`, () => {
    expect(new SafeFloat(-2.9999).floor(3))
      .toEqual(-3);
  });

  it(`should return new SafeFloat(2.9999).cut(3) => 2.999`, () => {
    expect(new SafeFloat(2.9999).cut(3))
      .toEqual(2.999);
  });
  it(`should return new SafeFloat(-2.9999).cut(3) => -2.999`, () => {
    expect(new SafeFloat(-2.9999).cut(3))
      .toEqual(-2.999);
  });

  it(`should return new SafeFloat(-1.6e-7).floor(8) => -1.6e-7`, () => {
    expect(new SafeFloat(-1.6e-7).floor(8))
      .toEqual(-1.6e-7);
  });

});

describe('safeFloat rounding return string form works', () => {

  it('should return new SafeFloat(0).floorStr(8) => 0.00000000', () => {
    expect(new SafeFloat(0).floorStr(8))
      .toEqual('0.00000000');
  });

  it('should return new SafeFloat(0).floorStr(8, true) => 0', () => {
    expect(new SafeFloat(0).floorStr(8, true))
      .toEqual('0');
  });

  it(`should return new SafeFloat(-2.9999).ceilStr(3) => -2.999`, () => {
    expect(new SafeFloat(-2.9999).ceilStr(3))
      .toEqual('-2.999');
  });

  it(`should return new SafeFloat(2.9999).ceilStr(3) => 3.000`, () => {
    expect(new SafeFloat(2.9999).ceilStr(3))
      .toEqual('3.000');
  });

  it('should return new SafeFloat(0.123456).cutStr(0) => 0', () => {
    expect(new SafeFloat(0.123456).cutStr(0))
      .toEqual('0');
  });

  it(`should return new SafeFloat(10000000).mult(1000000000).floorStr(8)=> 10000000000000000.00000000`, () => {
    expect(new SafeFloat(100000000000000000).floorStr(8))
      .toEqual('100000000000000000.00000000');
  });

  it('should return new SafeFloat(0.123456).floorStr(0) => 0', () => {
    expect(new SafeFloat(0.123456).floorStr(0))
      .toEqual('0');
  });

  it('should return new SafeFloat(123.45600).floorStr() => 123.456', () => {
    expect(new SafeFloat(123.45600).floorStr())
      .toEqual('123');
  });

})

describe('safeFloat rounding with mask, or mask works', () => {

  it('should return new SafeFloat(123456.123).floorMask(4, true) => 0', () => {

    expect(new SafeFloat(123456.123).floorMask(4))
      .toEqual('123,456.1230');
  });

  it(`should return mask`, () => {
    expect(SafeFloat.mask('-12345.1235'))
      .toEqual('-12,345.1235');
  });

    it(`should return new SafeFloat(-81235678.87).mask() => -81,235,678.87`, () => {
    expect(new SafeFloat(-81235678.87).mask())
      .toEqual('-81,235,678.87');
  });

  it(`should return new SafeFloat(-81235678.87).mask(5) => -81,235,678.87000`, () => {
    expect(new SafeFloat(-81235678.87).mask(5))

      .toEqual('-81,235,678.87000');
  });

})

describe.skip('safeFloat plus to max_safe_integer', () => {

  it('Number.MAX_SAFE_INTEGER(9007199254740991) + 2 => 9007199254740993',()=>{
    expect(new SafeFloat(Number.MAX_SAFE_INTEGER).plus(2).toString())
      .toEqual('9007199254740993')
  })

  // it.skip('should throw error', () => {
  //   expect(() => new SafeFloat(123456).div(new SafeFloat(0)))
  //     .toThrow()
  // });
})
