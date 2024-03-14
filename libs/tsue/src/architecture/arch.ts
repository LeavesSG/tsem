// deno-lint-ignore-file no-explicit-any no-this-alias
import { arrayLikeOr } from "../arr-like/bit-operation.ts";
import { ConstructorType, ConsTuple, InstanceIntersection } from "../hierarchy/constructor.ts";
import { applyMixins } from "../hierarchy/mixin.ts";
import { Ordering, PartialCmp } from "../traits/cmp.ts";

const CONS_BUF = Symbol("constructor buffer");
const ARCH_KEY = Symbol("architecture key");
const ARCHITECTURE = Symbol("architecture");

declare type ArchKey = Uint32Array;
abstract class ArchMixin {
    abstract [CONS_BUF]: ConstructorType[];
    abstract [ARCH_KEY]: ArchKey;
    abstract [ARCHITECTURE]: Architecture;
}

/**
 * A struct that represent a composition of types.
 * Instantiate with time proportion to O(M) where M:number of types in composed.
 * Provide methods to allow comparison in O(N) times(N:number of types in scope).
 * Suitable for cases where types are widely composed with frequent comparison.
 *
 * # Spec
 * - Arch A is equal to Arch B when A and B contains same types.
 * - Arch A is considered less than or equal to Arch B when B contains every type in A.
 * - Constructor will return the same instance when they contains exactly same types.
 */
export class Architecture<T = unknown> implements PartialCmp<Architecture<T>> {
    static knownCons = new WeakMap<ConstructorType, ArchKey>();
    static knownArch = new Map<string, Architecture>();
    static consCounter = 0;

    static getKeyTop() {
        const size = this.consCounter + 1;
        const length = Math.ceil(size / 32);
        const fraction = this.consCounter % 32;
        const ptr = new Uint32Array(length);
        ptr[ptr.length - 1] = 1 << fraction;
        return ptr;
    }

    static getConsKey(cons: ConstructorType) {
        const found = this.knownCons.get(cons);
        if (found) return found;
        let archKey: ArchKey;
        if (cons instanceof ArchMixin) {
            archKey = this.getConsVecKey(...cons[CONS_BUF]);
        } else if (cons instanceof Architecture) {
            archKey = cons[ARCH_KEY];
        } else {
            archKey = this.getKeyTop();
        }
        this.knownCons.set(cons, archKey);
        this.consCounter++;
        return archKey;
    }

    static getConsVecKey(...consVec: ConstructorType[]) {
        const archKeys = consVec.map(cons => this.getConsKey(cons));
        return arrayLikeOr(...archKeys);
    }

    declare [CONS_BUF]: ConstructorType[];
    declare [ARCH_KEY]: ArchKey;
    constructor(...consVec: ConstructorType[]) {
        const archKey = Architecture.getConsVecKey(...consVec);
        const archKeyStr = archKey.toString();
        const found = Architecture.knownArch.get(archKeyStr);
        if (found) return found as Architecture<T>;
        this[CONS_BUF] = consVec;
        this[ARCH_KEY] = archKey;
        Architecture.knownArch.set(archKeyStr, this);
    }

    static from<T extends ConsTuple = [any, ...any[]]>(...consVec: T) {
        return new Architecture(...consVec) as Architecture<InstanceIntersection<T>>;
    }

    private _mixin:
        | ConstructorType<
            T & {
                consBuf: ConstructorType[];
                archKey: ArchKey;
            }
        >
        | undefined;

    /** Mixin the types in architecture and return a constructor. */
    public mixin(): ConstructorType<
        T & {
            consBuf: ConstructorType[];
            archKey: ArchKey;
        }
    > {
        if (this._mixin) return this._mixin;
        const self = this;
        this._mixin = applyMixins(
            class extends ArchMixin {
                [CONS_BUF] = self[CONS_BUF];
                [ARCH_KEY] = self[ARCH_KEY];
                [ARCHITECTURE] = self;
            },
            self[CONS_BUF],
        ) as unknown as ConstructorType<
            T & {
                consBuf: ConstructorType[];
                archKey: ArchKey;
            }
        >;
        return this._mixin!;
    }

    public includes(other: Architecture) {
        const otherKey = other[ARCH_KEY];
        const or = arrayLikeOr(this[ARCH_KEY], otherKey);
        return or.toString() === otherKey.toString();
    }

    public extends(other: Architecture): other is Architecture<T> {
        const otherKey = other[ARCH_KEY];
        const or = arrayLikeOr(this[ARCH_KEY], otherKey);
        return or.toString() === this[ARCH_KEY].toString();
    }

    partialCmp(other: Architecture) {
        const thisKey = this[ARCH_KEY];
        const otherKey = other[ARCH_KEY];
        const orStr = arrayLikeOr(thisKey, otherKey).toString();
        const thisKeyStr = thisKey.toString();
        const otherKeyStr = otherKey.toString();
        if (thisKeyStr === otherKeyStr) return Ordering.Equal;
        else if (orStr === thisKeyStr) return Ordering.Less;
        else if (orStr === otherKeyStr) return Ordering.Greater;
        return void 0;
    }
}
