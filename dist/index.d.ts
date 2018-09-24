declare type SafeFloatAcceptableType = number | string | SafeFloat;
export declare class SafeFloat {
    value: any;
    constructor(int: any, precision?: number);
    static matchingPrecision(x: SafeFloat, y: SafeFloat): {
        x: {
            int: any;
            precision: any;
        };
        y: {
            int: any;
            precision: any;
        };
    };
    static calculate(n1: SafeFloatAcceptableType, n2: SafeFloatAcceptableType, op: string): SafeFloat;
    static getPrecision(a: SafeFloatAcceptableType): SafeFloat;
    static isNumber(n: any): boolean;
    static repeatZero(n: number): string;
    static strRepeat(str: string, n: number): string;
    static mask(_num: any): string;
    private convertToStrNumber;
    static plus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static minus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static mult(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static div(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    toNumber(): number;
    ceil(precision: number, isString?: boolean): string | number;
    round(precision: number, isString?: boolean): string | number;
    floor(precision: number, isString?: boolean): string | number;
    toString(): string;
    mask(): string;
    toFixed(precision: number, rounding?: 0 | 1 | -1, mask?: boolean): string;
    private dealRounding;
    plus(x: SafeFloatAcceptableType): SafeFloat;
    minus(x: SafeFloatAcceptableType): SafeFloat;
    mult(x: SafeFloatAcceptableType): SafeFloat;
    div(x: SafeFloatAcceptableType): SafeFloat;
}
export {};
