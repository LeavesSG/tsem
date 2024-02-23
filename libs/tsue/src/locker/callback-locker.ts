import { FunctionType } from "../func/func.ts";
import { tryAwait } from "../try-await/try-await.ts";

export interface LockedCallbackCfg {
    /**
     * Max amount of invocations of given callback waiting in queue. Further invocations will
     * be neglected instead of waited.
     */
    maxInQueue: number;
}

export const LOCKED_CALLBACK_DEFAULT_CFG: LockedCallbackCfg = {
    maxInQueue: Infinity,
};

type ConstructorParameters<T extends FunctionType> = [
    callback: T,
    cfg?: Partial<LockedCallbackCfg>,
];

/**
 * An util class create a copy of given callback, which allows user to
 * delay its invocation until unlock.
 * # Example
 * ```typescript
 * const callback = () => console.log("invoke");
 * const locked = new LockedCallback(callback);
 * const unlock = locked.lockup();
 * const res = locked.locked(); // won't log anything
 * unlock();
 * await res;   // log "invoke"
 * ```
 */
export class LockedCallback<T extends FunctionType> {
    /** Callback that has been locked from invocation. */
    private cb;
    /** Locked callback cfg */
    private cfg;

    constructor(...args: ConstructorParameters<T>) {
        const [callback, cfg] = args;
        this.cb = callback;
        this.cfg = {
            ...LOCKED_CALLBACK_DEFAULT_CFG,
            ...cfg,
        };
    }

    static from<T extends FunctionType>(...args: ConstructorParameters<T>) {
        return new this<T>(...args);
    }

    /** Id of invocation */
    private callId = 0;

    /** Locked callback */
    get locked(): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
        const { maxInQueue } = this.cfg;

        return async (...args) => {
            // If cb is never locked, invoke cb instantly.
            if (this.lockChain.size === 0) {
                return this.cb(...args) as ReturnType<T>;
            }

            // if invocation count larger than max calls in queue, ignore.
            if (maxInQueue < ++this.callId) {
                return void 0;
            }

            // wait in queue
            await tryAwait(this.lockChain);
            this.callId--;
            return this.cb(...args) as ReturnType<T>;
        };
    }

    /** Collection of all active locks */
    public lockChain = new Set<Promise<void>>();

    /**
     * Lock up the callback invocation, return the function to unlock it.
     */
    lockup() {
        let unlock: (value: void | PromiseLike<void>) => void;
        const lock = new Promise<void>((res) => {
            unlock = res;
        });
        this.lockChain.add(lock);
        return unlock!;
    }
}
