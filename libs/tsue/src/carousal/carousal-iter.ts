export interface CarousalIterOptions {
    reverse: boolean;
    maxIter: number;
}

export const DEFAULT_OPTIONS: CarousalIterOptions = {
    reverse: false,
    maxIter: Infinity,
};

type ConstructorParameters<T, TReturn, TNext> = [
    iterator: Iterator<T, TReturn, TNext>,
    options?: Partial<CarousalIterOptions>,
];

export class CarousalIter<T, TReturn = any, TNext = undefined>
    implements Iterator<T, TReturn, TNext> {
    private iter: Iterator<T, TReturn, TNext>;
    private history: T[] = [];
    private count = 1;
    private opt: CarousalIterOptions;

    constructor(
        ...args: ConstructorParameters<T, TReturn, TNext>
    ) {
        const [iterator, options] = args;
        this.iter = iterator;
        this.opt = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
    }

    static from<const T, const TReturn, const TNext>(
        ...args: ConstructorParameters<T, TReturn, TNext>
    ) {
        return new this(...args);
    }

    public makeIter() {
        if (this.opt.reverse) {
            this.history.reverse();
        }
        this.iter = this.history[Symbol.iterator]() as Iterator<
            T,
            TReturn,
            TNext
        >;
        this.history = [];
        if (this.opt.reverse) this.next();
        this.count++;
    }
    next(): IteratorResult<T, TReturn> {
        const next = this.iter.next();
        if (!next.done) {
            this.history.push(next.value);
            return next;
        } else if (this.count < this.opt.maxIter) {
            this.makeIter();
            return this.next();
        }
        return next;
    }
}
