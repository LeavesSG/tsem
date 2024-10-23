import type { PHANTOM_MARKER, PhantomMarker } from "../../types/phantom.ts";

export class PropPath<S, P extends (string | number | symbol)[] = []> {
    private source: S;
    private keyPath = [] as unknown as P;

    declare [PHANTOM_MARKER]: {
        touched: ThroughPath<S, P>;
    };

    constructor(source: S) {
        this.source = source;
    }

    prop<const K extends keyof this[PhantomMarker]["touched"]>(propKey: K) {
        const cloned = PropPath.from(this.source) as unknown as PropPath<S, [...P, K]>;
        cloned.keyPath = [...this.keyPath, propKey];
        return cloned;
    }

    touch(): this[PhantomMarker]["touched"] {
        return this.keyPath.reduce((a: any, c) => a[c], this.source);
    }

    static from<const T>(source: T) {
        return new this<T, []>(source);
    }
}

type ThroughPath<T, P extends (string | number | symbol)[]> = P extends [infer K, ...infer Rest extends any[]]
    ? K extends keyof T ? ThroughPath<T[K], Rest> : never
    : T;
