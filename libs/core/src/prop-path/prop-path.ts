import { PHANTOM_MARKER } from "../shared/phantom.ts";
import type { Clone } from "../traits/clone.ts";
import type { ObjKey } from "../vanilla/obj.ts";

export class PropPath<S = any, P extends ObjKey[] = ObjKey[]> implements Clone {
    private sourceObj: S;
    private keyPath = [] as unknown as P;

    declare [PHANTOM_MARKER]: {
        probed: ThroughPath<S, P>;
    };

    source(): S {
        return this.sourceObj;
    }

    path(): P {
        return this.keyPath;
    }

    constructor(source: S) {
        this.sourceObj = source;
    }
    clone(): typeof this {
        const cloned = new PropPath<S, P>(this.sourceObj);
        cloned.keyPath = [...this.keyPath] as P;
        return cloned as typeof this;
    }

    prop<const K extends keyof this[typeof PHANTOM_MARKER]["probed"]>(
        propKey: K,
    ): PropPath<S, [...P, K]> {
        const cloned = this.clone();
        cloned.keyPath.push(propKey);
        return cloned as unknown as PropPath<S, [...P, K]>;
    }

    probe(): this[typeof PHANTOM_MARKER]["probed"] {
        return this.keyPath.reduce((a: any, c) => a[c], this.sourceObj);
    }

    debug(): string {
        return `$${this.keyPath.map((key) => `[${fmtObjKey(key)}]`).join("")}`;
    }

    static from<const T>(source: T): PropPath<T, []> {
        return new this<T, []>(source);
    }
}

type ThroughPath<T, P extends (string | number | symbol)[]> = P extends
    [infer K, ...infer Rest extends any[]]
    ? K extends keyof T ? ThroughPath<T[K], Rest> : never
    : T;

const fmtObjKey = (val: ObjKey) => {
    switch (typeof val) {
        case "string":
            return `"${val}"`;
        case "number":
        case "symbol":
            return val.toString();
    }
};
