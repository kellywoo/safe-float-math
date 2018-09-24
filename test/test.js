'use strict';
const {SafeFloat} = require('../dist/index.js');
const expect = require('chai').expect;
const num =31110.499925;
const sf = new SafeFloat(num);
describe('get safeFloat function test', () => {
  it('should return 0.3', () => {
    var result = new SafeFloat(0.1).plus(0.2).toNumber();
    expect(result).to.equal(0.3);
  });
  it('should return 15.97', () => {
    var result = new SafeFloat(8.87).plus(7.1).toNumber();
    expect(result).to.equal(15.97);
  });
  console.log(`num is ${num}`)
  it(`should return round => 31110.49993`, () => {
    var result = sf.round(5);
    expect(result).to.equal(31110.49993);
  });
  it(`should return ceil => 31110.49993`, () => {
    var result = sf.ceil(5);
    expect(result).to.equal(31110.49993);
  });
  it(`should return floor => 31110.49992`, () => {
    var result = sf.floor(5);
    expect(result).to.equal(31110.49992);
  });
  it(`should return floor as string => 31110.49992`, () => {
    var result = sf.floor(5, true);
    expect(result).to.equal('31110.49992');
  });
  it(`should return floor as string with mask => 31,110.49992`, () => {
    var result = sf.toFixed(5, -1, true);
    expect(result).to.equal('31,110.49992');
  });
  it(`should return SafeFloat(-8.87).plus(-7.1).toString() => -15.97`, () => {
    var result = new SafeFloat(-8.87).plus(-7.1).toString();
    expect(result).to.equal('-15.97');
  });
  it(`should return SafeFloat(-81235678.87).mask() => -81,235,678.87`, () => {
    var result = new SafeFloat(-81235678.87).mask();
    expect(result).to.equal('-81,235,678.87');
  });
});

