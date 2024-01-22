import { LockedCallback } from "../locker/callback-locker.ts";
import {
    CarousalIter,
    CarousalIterOptions,
    DEFAULT_OPTIONS as DEFAULT_ITER_OPTIONS,
} from "./carousal-iter.ts";

interface CarousalOptions extends CarousalIterOptions {
    interval: number;
}

type ConstructorParameters<T> = [
    frames: Iterable<T>,
    onChange?: OnChange<T>,
    options?: Partial<CarousalOptions>,
];

type OnChange<T> = (arg: T) => unknown;

const DEFAULT_OPTIONS = {
    ...DEFAULT_ITER_OPTIONS,
    interval: 1000,
};

export class Carousal<T> {
    private iter: Iterator<T>;
    private opt: CarousalOptions;
    private onChangeCbs = new Set<OnChange<T>>();

    activeIndex = 0;
    timeOut: ReturnType<typeof setTimeout> | undefined;
    constructor(...args: ConstructorParameters<T>) {
        const [frames, onChange, options] = args;
        this.iter = CarousalIter.from(frames[Symbol.iterator]());
        this.opt = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
        if (onChange) this.onChange(onChange);

        const carousal = () => {
            this.next();
            this.timeOut = setTimeout(locked, this.opt.interval);
        };
        const lockable = LockedCallback.from(carousal);
        const { locked } = lockable;

        this.pause = () => {
            if (this.locked) return;
            this.locked = true;
            const unlock = lockable.lockup();
            this.resume = () => {
                this.locked = false;
                unlock();
            };
        };
        this.start = () => locked();
        this.stop = () => clearTimeout(this.timeOut);
    }

    static from<const T>(...args: ConstructorParameters<T>) {
        return new this(...args);
    }

    private locked = false;
    public pause;
    public resume = () => {};
    public start;
    public stop;

    onChange(onChange: OnChange<T>) {
        this.onChangeCbs.add(onChange);
        return this;
    }

    next() {
        const { done, value } = this.iter.next();
        if (done) return;
        this.onChangeCbs.forEach((cb) => cb(value));
        return {
            done,
            value,
        };
    }
}
