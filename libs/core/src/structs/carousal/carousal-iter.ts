export interface CarousalIterCfg {
    /** Reverse on emit direction after each row. */
    reverse: boolean;
    /** Max iteration count. */
    maxIter: number;
}

export const CAROUSAL_INTER_DEFAULT_CFG: CarousalIterCfg = {
    reverse: false,
    maxIter: Infinity,
};

type ConstructorParameters<T, TReturn, TNext> = [
    iterator: Iterator<T, TReturn, TNext>,
    cfg?: Partial<CarousalIterCfg>,
];

/**
 * An util class create a repeatable iterator from a given iterator.
 */
export class CarousalIter<T, TReturn = unknown, TNext = undefined> implements Iterator<T, TReturn, TNext> {
    /** Source iterator */
    private iter: Iterator<T, TReturn, TNext>;
    /** Emit history */
    private history: T[] = [];
    /** Iteration count */
    private count = 1;
    /** Configuration */
    private cfg: CarousalIterCfg;

    constructor(
        ...args: ConstructorParameters<T, TReturn, TNext>
    ) {
        const [iterator, cfg] = args;
        this.iter = iterator;
        this.cfg = {
            ...CAROUSAL_INTER_DEFAULT_CFG,
            ...cfg,
        };
    }

    static from<const T, const TReturn, const TNext>(
        ...args: ConstructorParameters<T, TReturn, TNext>
    ) {
        return new this(...args);
    }

    private expandIter() {
        if (this.cfg.reverse) {
            this.history.reverse();
        }
        this.iter = this.history[Symbol.iterator]() as Iterator<
            T,
            TReturn,
            TNext
        >;
        this.history = [];

        if (this.cfg.reverse) {
            this.next();
        }

        this.count++;
    }
    next(): IteratorResult<T, TReturn> {
        const next = this.iter.next();
        if (!next.done) {
            this.history.push(next.value);
            return next;
        } else if (this.count < this.cfg.maxIter) {
            this.expandIter();
            return this.next();
        }
        return next;
    }
}
