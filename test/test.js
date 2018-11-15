'use strict';
const {SafeFloat} = require('../dist/index.js');
const expect = require('chai').expect;
const num =31110.499925;
const sf = new SafeFloat(num);
describe('get safeFloat function test', () => {
  it('should return SafeFloat.plus(0.1, 0.2) => 0.3', () => {
    var result = SafeFloat.plus(0.1, 0.2).toNumber();
    expect(result).to.equal(0.3);
  });
  it('should return 15.97', () => {
    var result = new SafeFloat(8.87).plus(7.1).toNumber();
    expect(result).to.equal(15.97);
  });
  it(`should return round => 31110.49993`, () => {
    var result = sf.round(5);
    expect(result).to.equal(31110.49993);
  });
  it(`should return ceil => 31110.49993`, () => {
    var result = sf.ceil(5);
    expect(result).to.equal(31110.49993);
  });
  it(`should return new SafeFloat(-8.87).plus(-7.1).toString() => -15.97`, () => {
    var result = new SafeFloat(-8.87).plus(-7.1).toString();
    expect(result).to.equal('-15.97');
  });
  it(`should return new SafeFloat(-81235678.87).mask() => -81,235,678.87`, () => {
    var result = new SafeFloat(-81235678.87).mask();
    expect(result).to.equal('-81,235,678.87');
  });
  it(`should return new SafeFloat(-81235678.87).mask(5) => -81,235,678.87000`, () => {
    var result = new SafeFloat(-81235678.87).mask(5);
    expect(result).to.equal('-81,235,678.87000');
  });
  it(`should return new SafeFloat(2.9999).floor(3) => 2.999`, () => {
    var result = new SafeFloat(2.9999).floor(3);
    expect(result).to.equal(2.999);
  });
  it(`should return new SafeFloat(-2.9999).floor(3) => -3`, () => {
    var result = new SafeFloat(-2.9999).floor(3);
    expect(result).to.equal(-3);
  });
  it(`should return new SafeFloat(2.9999).cut(3) => 2.999`, () => {
    var result = new SafeFloat(2.9999).cut(3);
    expect(result).to.equal(2.999);
  });
  it(`should return new SafeFloat(-2.9999).cut(3) => -2.999`, () => {
    var result = new SafeFloat(-2.9999).cut(3);
    expect(result).to.equal(-2.999);
  });

  it(`should return new SafeFloat(-2.9999).ceilStr(3) => -2.999`, () => {
    var result = new SafeFloat(-2.9999).ceilStr(3);
    expect(result).to.equal('-2.999');
  });
  it(`should return new SafeFloat(2.9999).ceilStr(3) => 3.000`, () => {
    var result = new SafeFloat(2.9999).ceilStr(3);
    expect(result).to.equal('3.000');
  });
  it(`should return SafeFloat.trimZero(new SafeFloat(2.9999).ceilStr(3)) => 3`, () => {
    var result = SafeFloat.trimZero(new SafeFloat(2.9999).ceilStr(3));
    expect(result).to.equal('3');
  });
  it(`should return new SafeFloat(-1.6e-7).floor(8) => -1.6e-7`, () => {
    var result = new SafeFloat(-1.6e-7).floor(8);
    expect(result).to.equal(-1.6e-7);
  });
  it('should return new SafeFloat(0).floorStr(8) => 0.00000000', () => {
    var result = new SafeFloat(0).floorStr(8);
    expect(result).to.equal('0.00000000');
  });
  it('should return new SafeFloat(0).floorStr(8, true) => 0', () => {
    var result = new SafeFloat(0).floorStr(8, true);
    expect(result).to.equal('0');
  });
  it(`should return mask`, () => {
    var result = SafeFloat.mask('-12345.1235');
    expect(result).to.equal('-12,345.1235');
  });
  it(`should return new SafeFloat(10000000).mult(1000000000).floorStr(8)=> 10000000000000000.00000000`, () => {
    var result = new SafeFloat(10000000).mult(1000000000).floorStr(8)
    expect(result).to.equal('10000000000000000.00000000');
  });
  it('should return new SafeFloat(0.123456).floorStr(0) => 0', () => {
    var result = new SafeFloat(0.123456).floorStr(0);
    expect(result).to.equal('0');
  });
  it('should return new SafeFloat(0.123456).cutStr(0) => 0', () => {
    var result = new SafeFloat(0.123456).cutStr(0);
    expect(result).to.equal('0');
  });
  it('should return new SafeFloat(123456.123).floorMask(4, true) => 0', () => {
    var result = new SafeFloat(123456.123).floorMask(4);
    expect(result).to.equal('123,456.1230');
  });
  it('should return new SafeFloat(0.123456, 6).toString() => 0.000000123456', () => {
    var result = new SafeFloat(0.123456, 6).toString();
    expect(result).to.equal('0.000000123456');
  });
  it('should return new SafeFloat(0.123456).toString(2) => 0.123456', () => {
    var result = new SafeFloat(0.123456).toString(2);
    expect(result).to.equal('0.123456');
  });
  it('should return new SafeFloat(0.123456).toString(9) => 0.123456000', () => {
    var result = new SafeFloat(0.123456).toString(9);
    expect(result).to.equal('0.123456000');
  });
  it('should return new SafeFloat(123456).toString(3) => 123456.000', () => {
    var result = new SafeFloat(123456).toString(3);
    expect(result).to.equal('123456.000');
  });
});

