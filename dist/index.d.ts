export declare type SafeFloatAcceptableType = number | string | SafeFloat;
export declare type RoundingType = 0 | 1 | -1;
export declare type SignType = -1 | 1;
export declare class SafeFloat {
    value: any;
    constructor(num: any, precision?: number);
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
    static create(a: SafeFloatAcceptableType): SafeFloat;
    static isNumber(n: any): boolean;
    static repeatZero(n: number): string;
    static strRepeat(str: string, n: number): string;
    static mask(_num: any): string;
    static plus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static minus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static mult(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static div(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static trimZero(str: string): string;
    static neat(str: string, should?: boolean): string;
    static hasPoint(str: string): boolean;
    toNumber(): number;
    ceil(precision: number): number;
    round(precision: number): number;
    floor(precision: number): number;
    ceilStr(precision: number, neat?: boolean): string;
    roundStr(precision: number, neat?: boolean): string;
    floorStr(precision: number, neat?: boolean): string;
    toString(): string;
    mask(): string;
    toFixed(precision: number, rounding?: RoundingType, mask?: boolean): string;
    private dealRounding;
    plus(x: SafeFloatAcceptableType): SafeFloat;
    minus(x: SafeFloatAcceptableType): SafeFloat;
    mult(x: SafeFloatAcceptableType): SafeFloat;
    div(x: SafeFloatAcceptableType): SafeFloat;
}
