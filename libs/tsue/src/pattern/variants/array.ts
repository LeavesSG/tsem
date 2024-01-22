import { FromPattern } from "../transform.ts";
import { PatternType } from "../variants.ts";

export const ArrayPatternKey = PatternType.Array;

export type ArrayPattern<T = unknown> = {
    [ArrayPatternKey]: T;
};

export type FromArrayPattern<T extends ArrayPattern> = T extends ArrayPattern<infer R>
    ? FromPattern<R>
    : never;

export function isArrayPattern(val: unknown): val is ArrayPattern {
    if (typeof val !== "object" || val === null) return false;
    if (!(ArrayPatternKey in val)) return false;
    const vec = val[ArrayPatternKey];
    if (!Array.isArray(vec) || vec.length === 0) return false;
    return true;
}
