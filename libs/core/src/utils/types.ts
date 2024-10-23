export type SimpleIntersection<T extends any[], __Int = unknown> = T extends [infer T, ...infer Rest extends any[]]
    ? SimpleIntersection<Rest, __Int & T>
    : __Int;

/**
 * UnionToIntersection<{ foo: string } | { bar: string }> =
 *  { foo: string } & { bar: string }.
 */
export type UnionToIntersection<U> = (
    U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0 ? I
    : never;

/**
 * LastInUnion<1 | 2> = 2.
 */
type LastInUnion<U> = UnionToIntersection<
    U extends unknown ? (x: U) => 0 : never
> extends (x: infer L) => 0 ? L
    : never;

/**
 * UnionToTuple<1 | 2> = [1, 2].
 */
export type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never] ? []
    : [...UnionToTuple<Exclude<U, Last>>, Last];

export type CoverMerge<T, U> =
    & {
        [K in Exclude<keyof T, keyof U>]: T[K];
    }
    & U;

export type TupleIntersection<T extends any[], __R = unknown> = T extends [infer R, ...infer Rest extends any[]]
    ? TupleIntersection<Rest, R & __R>
    : __R;