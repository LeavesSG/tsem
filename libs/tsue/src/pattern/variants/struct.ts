import { FromPattern } from "../transform.ts";
import { isArrayPattern } from "./array.ts";
import { isUnionPattern } from "./union.ts";

export type StructPattern = Record<string, unknown>;

// This should not be use, for better visualization on ide.
export type FromStructPattern<T extends StructPattern> = {
    -readonly [K in keyof T]: FromPattern<T[K]>;
};

export function isStructPattern(val: unknown): val is StructPattern {
    if (null === val) return false;
    if (typeof val !== "object") return false;
    if (Array.isArray(val)) return false;
    if (isArrayPattern(val) || isUnionPattern(val)) return false;
    return true;
}
