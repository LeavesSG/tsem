type ArrayLike<T> = {
    [index: number]: T;
} & {
    length: number;
};

export function arrayLikeOr(...vecs: ArrayLike<number>[]) {
    const maxLen = Math.max(...vecs.map(vec => vec.length));
    const res = new Uint32Array(maxLen);
    for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < vecs.length; j++) {
            res[i] |= vecs[j][i] ?? 0;
        }
    }

    return res;
}

export function arrayLikeAnd(...vecs: ArrayLike<number>[]) {
    const maxLen = Math.max(...vecs.map(vec => vec.length));
    const res = new Uint32Array(maxLen);
    for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < vecs.length; j++) {
            res[i] &= vecs[j][i] ?? 0;
        }
    }
    return res;
}
