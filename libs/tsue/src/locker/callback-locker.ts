import { FunctionType } from "../func/func.ts";
import { tryAwait } from "../try-await/try-await.ts";

interface LockedCallbackOptions {
    /**
     * Will it skip the invocation of the callback function when locked
     * or keep all the invocations until unlock.
     */
    maxInQueue: number;
}

const DEFAULT_OPTIONS: LockedCallbackOptions = {
    maxInQueue: Infinity,
};

export class LockedCallback<T extends FunctionType> {
    private cb;
    private opt;

    constructor(callback: T, options?: Partial<LockedCallbackOptions>) {
        this.cb = callback;
        this.opt = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
    }

    static from<T extends FunctionType>(callback: T, options?: Partial<LockedCallbackOptions>) {
        return new this<T>(callback, options);
    }

    private callId = 0;
    private queue = new Set();

    get locked(): (...args: Parameters<T>) => ReturnType<T> | Promise<ReturnType<T> | undefined> {
        const { maxInQueue } = this.opt;

        return async (...args) => {
            const id = this.callId++;
            if (this.lockChain.size === 0) return this.cb(...args) as ReturnType<T>;
            if (maxInQueue < this.queue.size) return void 0;
            this.queue.add(id);
            await tryAwait(this.lockChain);
            this.queue.delete(id);
            return this.cb(...args) as ReturnType<T>;
        };
    }

    private keyId = 0;
    public lockChain = new Set<Promise<void>>();
    public keyChain = new Map<number, FunctionType>();

    private makeKeyAndLock() {
        const id = this.keyId++;
        const lock = new Promise<void>((res) => {
            this.keyChain.set(id, res);
        });
        this.lockChain.add(lock);
        return this.keyChain.get(id)!;
    }

    lockup() {
        return this.makeKeyAndLock();
    }
}
