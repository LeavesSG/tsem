import { PatternType } from "../variants.ts";
import { FromTuplePattern, TuplePattern } from "./tuple.ts";

export const UnionPatternKey = PatternType.Union;

export type UnionPattern<T extends TuplePattern = TuplePattern> = {
    [UnionPatternKey]: T;
};

export type FromUnionPattern<T extends UnionPattern> = T extends UnionPattern<infer R> ? FromTuplePattern<R>[number]
    : never;

export function isUnionPattern(
    val: unknown,
): val is UnionPattern {
    if (typeof val !== "object" || val === null) return false;
    if (!(UnionPatternKey in val)) return false;
    const vec = val[UnionPatternKey];
    if (!Array.isArray(vec) || vec.length === 0) return false;
    return true;
}
