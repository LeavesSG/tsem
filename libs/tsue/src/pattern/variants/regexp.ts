export type RegExpPattern = RegExp;

export type FromRegExpPattern = string;

export type ToRegExpPattern = RegExp;

export function isRegExpPattern(val: unknown): val is RegExp {
    return val instanceof RegExp;
}
