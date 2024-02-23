import { LockedCallback } from "../locker/callback-locker.ts";
import { CAROUSAL_INTER_DEFAULT_CFG, CarousalIter, CarousalIterCfg } from "./carousal-iter.ts";

interface CarousalCfg extends CarousalIterCfg {
    /** Interval between two steps */
    interval: number;
}

type ConstructorParameters<T> = [
    frames: Iterable<T>,
    onChange?: OnChange<T>,
    cfg?: Partial<CarousalCfg>,
];

type OnChange<T> = (arg: T) => unknown;

const CAROUSAL_DEFAULT_CFG: CarousalCfg = {
    ...CAROUSAL_INTER_DEFAULT_CFG,
    interval: 1000,
};

/** An util class to create a carousal from an iterator. */
export class Carousal<T> {
    /** Carousal Iterator */
    private iter: Iterator<T>;
    /** Configuration */
    private cfg: CarousalCfg;
    /** Registered callbacks trigger after pointer change */
    private onChangeCbs = new Set<OnChange<T>>();

    timeOut: ReturnType<typeof setTimeout> | undefined;
    constructor(...args: ConstructorParameters<T>) {
        const [frames, onChange, cfg] = args;
        this.iter = CarousalIter.from(frames[Symbol.iterator]());
        this.cfg = {
            ...CAROUSAL_DEFAULT_CFG,
            ...cfg,
        };
        if (onChange) this.onChange(onChange);

        const carousal = () => {
            this.next();
            this.timeOut = setTimeout(locked, this.cfg.interval);
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
    /** Resume the paused carousal, do nothing if not paused. */
    public resume = () => {};
    public start;
    public stop;

    /** Register a callback triggered after pointer change. */
    onChange(onChange: OnChange<T>) {
        this.onChangeCbs.add(onChange);
        return this;
    }

    /** Manually trigger the carousal move to next item */
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
