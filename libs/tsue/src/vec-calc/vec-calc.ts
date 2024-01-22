import { VecN } from "../vecn/vecn.ts";

export class VecCalc<N extends number> {
    N: N;
    constructor(n: N) {
        this.N = n;
    }
    add(vec1: VecN<number, N>, vec2: VecN<number, N>) {
        const vec = [];
        for (let i = 0; i < this.N; i++) {
            vec.push(vec1[i] + vec2[i]);
        }
    }

    negative(vec1: VecN<number, N>) {
        return vec1.map(n => -n);
    }
}
