import { FromPattern } from "../transform.ts";
import { ShallowWritableTuple } from "../writable.ts";

export type TuplePattern = unknown[];

export type FromTuplePattern<T extends TuplePattern> = __FromTuplePattern<ShallowWritableTuple<T>>;

export type __FromTuplePattern<T extends TuplePattern, _P extends unknown[] = []> = T extends
    [infer N, ...infer R] ? __FromTuplePattern<R, [..._P, FromPattern<N>]>
    : _P;

export function isTuplePattern(
    val: unknown,
): val is TuplePattern {
    if (!Array.isArray(val)) return false;
    if (val.length == 0) return false;
    return true;
}
