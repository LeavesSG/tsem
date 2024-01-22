export type ShallowWritableTuple<T extends readonly unknown[], _W extends unknown[] = []> =
    T extends readonly [infer S extends readonly unknown[], ...infer R extends unknown[]]
        ? ShallowWritableTuple<R, [
            ..._W,
            {
                -readonly [K in keyof S]: S[K];
            },
        ]>
        : T extends readonly [infer S, ...infer R extends unknown[]]
            ? ShallowWritableTuple<R, [..._W, S]>
        : _W;

export type ShallowWritableStruct<T> = {
    -readonly [K in keyof T]: T[K];
};
