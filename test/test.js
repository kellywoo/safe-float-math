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
  it(`should return new SafeFloat(-2.9999).floor(3) => -3`, () => {
    var result = new SafeFloat(-2.9999).floor(3);
    expect(result).to.equal(-3);
  });
  it(`should return new SafeFloat(2.9999).floor(3) => 2.999`, () => {
    var result = new SafeFloat(2.9999).floor(3);
    expect(result).to.equal(2.999);
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
  it(`should return mask`, () => {
    var result = SafeFloat.mask('-12345.1235')
    expect(result).to.equal('-12,345.1235');
  });
});

