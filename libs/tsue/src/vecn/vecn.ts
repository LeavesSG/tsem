type GetIndices<N, A extends never[] = []> = A["length"] extends N ? Extract<keyof A, `${number}`>
    : GetIndices<N, [...A, never]>;

export type VecN<T, N extends number> =
    & Array<T>
    & {
        length: N;
    }
    & {
        [K in GetIndices<N>]: T;
    };

export type Vec2<T = unknown> = VecN<T, 2>;
export type Vec3<T = unknown> = VecN<T, 3>;
export type Vec4<T = unknown> = VecN<T, 4>;
