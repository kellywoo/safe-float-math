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


## Running the tests

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

### supported format
```
const sf1 = new SafeFloat(1123.000233)
sf1.toString() // return '1123.000233'
sf1.toNumber() // return 1123.000233
sf1.mask() // return '1,123.000233'
sf1.toFixed(digits, rounding, mask) //return string
// precision :number toFixed digit
// rounding:  0 => rounding | 1 => ceil | -1 => floor
// mask: boolean display with commas
```

### math
```
0.1 + 0.2 
// 0.30000000000000004
const sf1 = new Safe(0.1)
const sf2 = new Safe(0.2)
sf1.plus(0.2).toNumber() === sf1.plus(sf2).toNumber()
// 0.3
// math: plus(+), minus(-), mult(*), div(/)
sf.plus(0.2).toString()
// '0.3'
new SafeFloat(-81235678.87).mask();
// '-81,235,678.87'

```

## Authors

* **Kelly Woo** - *Initial work* - [GitHub](https://github.com/kellywoo)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
