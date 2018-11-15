# Safe Float Math

## Getting Started

A helper for floating point number math

### Prerequisites

```
typescript, tslint, chai, mocha
spec: es5
```

### Installing

```
npm install safe-float-math
```

### import

```
// es5
const {SafeFloat} = require('safe-float-math');
// es6
import {SafeFloat} from 'safe-float-math'
```

### Running the tests

```
npm run test
```

## Usage

How to use

### new SafeFloat()
```
const sf1 = new SafeFloat(0.03:number) 
const sf2 = new SafeFloat(3:int, 2: precision)
sf1.toNumber() === sf2.toNumber()
// both 0.03
```

### supported static method

| static method | description |
| ------------- | ------------- |
| create(x)  | return safeFloat instance<br />(ex: SafeFloat.create(0.1)) |
| calculate(x, y, sign)  | return result safeFloat instance<br />(ex: SafeFloat.calculate(0.1, 0.2, '+')  |
|plus(x,y)| same as SafeFloat.calculate(a,b,'+')|
|minus(x,y)| same as SafeFloat.calculate(a,b,'-')|
|mult(x,y)| same as SafeFloat.calculate(a,b,'*')|
|div(x,y)| same as SafeFloat.calculate(a,b,'/')|
|cut(str, digit)| act like slice by nth-digit below zero|
|isNumber(x)| return boolean|
|mask(str)| add comma for thousand |
|strRepeat(str, num)| return string repeated|
|trimZero(str)| trim zeroes below decimal point|

```
SafeFloat.create(0.2) == new SafeFloat(0.2) //return SafeFloat instance for 0.2

SafeFloat.calculate(01, 0.2, '+') 
// return SafeFloat instance indicate 0.3

SafeFloat.plus(0.1, 0.2) 
// wraping method for calculate(+)
// math: plus(+), minus(-), mult(*), div(/)

SafeFloat.mask('-2345.1234')
//'-2,345.1234'

SafeFloat.trimZero('12.000') 
// '12'
SafeFloat.trimZero('12.0100')
// '12.01'

SafeFloat.strRepeat('h',3)
//'hhh'
```

### supported instance method

| instance method | description |
| ------------- | ------------- |
|toString(n?)| return string not tempered<br />but if n provided and n >= digits below zero<br /> :return string fills with '0' upto n-th digit <br />n < digits<br />: return string not tempered |
|toNumber()| return number not tempered|
|floor(digit)| return number floored by n-th digit below zero|
|floorStr(digit, neat?)| return string floored by n-th digit below zero|
|round(digit)| return number rounded by n-th digit below zero|
|roundStr(digit, neat?)| return string rounded by n-th digit below zero|
|ceil(digit)| return number ceiled by n-th digit below zero|
|ceilStr(digit, neat?)| return string ceiled by n-th digit below zero|
|cut(digit)| return number sliced by n-th digit below zero|
|cutStr(digit, neat?)|  return string sliced by n-th digit below zero|
|mask(str)| return result of toString() with mask|
|toFixed(digit, rounding, mask)| return string after tempered</ br>rounding(1:ceil, 0: rounding, -1: floor)|
|plus(x)| same as SafeFloat.calculate(this,x,'+')|
|minus(x)| same as SafeFloat.calculate(this,x,'-')|
|mult(x)| same as SafeFloat.calculate(this,x,'*')|
|div(x)| same as SafeFloat.calculate(this,x,'/')|

*digit(number) : nth digit below zero
*neat(boolean) : remove meaningless zeroes

```
difference between floor and cut(give different results on negative number)

new SafeFloat(-2.1239).floor(3) => -2.124
new SafeFloat(-2.1239).cut(3) => -2.123
```

```
const sf1 = new SafeFloat(1123.000233)

sf1.toString() 
// return '1123.000233'
sf1.toString(2)
// return '1123.000233'
sf1.toString(8)
// return '1123.00023300'


sf1.toNumber() 
// return 1123.000233

sf1.mask() 
// return '1,123.000233'

sf1.toFixed(digits, rounding: -1|0|1, mask) 
// return string
// precision :number toFixed digit
// rounding:  0 => rounding | 1 => ceil | -1 => floor
// mask: boolean display with commas

sf1.ceil(digits) //return ceiled number
sf1.round(digits) //return rounded number
sf1.floor(digits) //return floored number
sf1.ceilStr(digits) //return ceiled string
sf1.roundStr(digits) //return rounded string
sf1.floorStr(digits) //return floored string
```

### math
```
0.1 + 0.2 
// 0.30000000000000004

// use instance method

const sf1 = new Safe(0.1)
const sf2 = new Safe(0.2)
sf1.plus(0.2).toNumber() === sf1.plus(sf2).toNumber()
// 0.3
// math: plus(+), minus(-), mult(*), div(/)
sf.plus(0.2).toString()
// '0.3'


// use static method

SafeFloat.plus(0.1, 0.2).toString()
// 0.3
```

## Authors

* **Kelly Woo** - [GitHub](https://github.com/kellywoo)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/kellywoo/safe-float-math/blob/master/README.md) file for details
