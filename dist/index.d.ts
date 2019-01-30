export declare type SafeFloatAcceptableType = number | string | SafeFloat;
export declare type RoundingType = 0 | 1 | -1 | -2;
export declare type SignType = -1 | 1;
interface SafeFactor {
    i: number[];
    exp: {
        expI: string;
        expP: number;
    };
    string?: string;
    p: number;
    s: SignType;
}
export declare class SafeFloatHelper {
    static lengthBelowPoint(str: string): number;
    static abs(n: number): number;
    static strRepeat(str: string, n: number): string;
    static repeatZero(n: number): string;
    static isNumber(n: any): boolean;
    static isString(str: any): boolean;
    static toString(str: any): string;
    static comma(num: any): string;
}
export declare class SafeFloat {
    safeFactor: SafeFactor;
    readonly string: string;
    isSafeFloat(a: any): boolean;
    constructor(value: any, p?: number);
    static create(a: SafeFloatAcceptableType): SafeFloat;
    static mask(_num: number | string): string;
    static plus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static minus(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static mult(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    static div(x: SafeFloatAcceptableType, y: SafeFloatAcceptableType): SafeFloat;
    toNumber(): number;
    ceil(upto: number): number;
    round(upto: number): number;
    floor(upto: number): number;
    cut(upto: number): number;
    ceilStr(upto: number, neat?: boolean): string;
    roundStr(upto: number, neat?: boolean): string;
    floorStr(upto: number, neat?: boolean): string;
    cutStr(upto: number, neat?: boolean): string;
    ceilMask(upto: number, neat?: boolean): string;
    roundMask(upto: number, neat?: boolean): string;
    floorMask(upto: number, neat?: boolean): string;
    cutMask(upto: number, neat?: boolean): string;
    toString(upto?: number): string;
    mask(upto?: number, neat?: boolean): string;
    handleRounding(upto?: number, rounding?: RoundingType): string;
    plus(x: SafeFloatAcceptableType): SafeFloat;
    minus(x: SafeFloatAcceptableType): SafeFloat;
    mult(x: SafeFloatAcceptableType): SafeFloat;
    div(x: SafeFloatAcceptableType): SafeFloat;
}
export {};
