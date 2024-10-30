import type { ObjKey } from "../../types/obj.ts";
import type { PHANTOM_MARKER, PhantomMarker } from "../../types/phantom.ts";
import type { Clone } from "../traits/clone.ts";

export class PropPath<S = any, P extends ObjKey[] = ObjKey[]> implements Clone {
    private sourceObj: S;
    private keyPath = [] as unknown as P;

    declare [PHANTOM_MARKER]: {
        probed: ThroughPath<S, P>;
    };

    source() {
        return this.sourceObj;
    }

    path() {
        return this.keyPath;
    }

    constructor(source: S) {
        this.sourceObj = source;
    }
    clone() {
        const cloned = new PropPath<S, P>(this.sourceObj);
        cloned.keyPath = [...this.keyPath] as P;
        return cloned as typeof this;
    }

    prop<const K extends keyof this[PhantomMarker]["probed"]>(propKey: K) {
        const cloned = this.clone();
        cloned.keyPath.push(propKey);
        return cloned as unknown as PropPath<S, [...P, K]>;
    }

    probe(): this[PhantomMarker]["probed"] {
        return this.keyPath.reduce((a: any, c) => a[c], this.sourceObj);
    }

    debug() {
        return `$${this.keyPath.map((key) => `[${fmtObjKey(key)}]`).join("")}`;
    }

    static from<const T>(source: T) {
        return new this<T, []>(source);
    }
}

type ThroughPath<T, P extends (string | number | symbol)[]> = P extends [infer K, ...infer Rest extends any[]]
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
