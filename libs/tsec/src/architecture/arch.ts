// deno-lint-ignore-file no-explicit-any no-this-alias
import { arrayLikeOr } from "../arr-like/bit-operation.ts";
import { Ordering, PartialCmp } from "../cmp/mod.ts";
import { ConstructorType, ConsTuple, InstanceIntersection } from "../hierarchy/constructor.ts";
import { applyMixins } from "../hierarchy/mixin.ts";

type ArchKey = Uint32Array;

abstract class ArchMixin {
    abstract consBuf: ConstructorType[];
    abstract archKey: ArchKey;
}

export class Architecture<T = unknown> implements PartialCmp {
    static consCache = new WeakMap<ConstructorType, ArchKey>();
    static archCache = new Map<string, Architecture>();
    static consCounter = 0;

    static getKeyTop() {
        const size = this.consCounter + 1;
        const length = Math.ceil(size / 32);
        const fract = this.consCounter % 32;
        const ptr = new Uint32Array(length);
        ptr[ptr.length - 1] = 1 << fract;
        return ptr;
    }

    static getConsKey(cons: ConstructorType) {
        const found = this.consCache.get(cons);
        if (found) return found;
        let archKey: ArchKey;
        if (cons instanceof ArchMixin) {
            archKey = this.getConsVecKey(...cons.consBuf);
        } else if (cons instanceof Architecture) {
            archKey = cons.archKey;
        } else {
            archKey = this.getKeyTop();
        }
        this.consCache.set(cons, archKey);
        this.consCounter++;
        return archKey;
    }

    static getConsVecKey(...consVec: ConstructorType[]) {
        const archKeys = consVec.map(cons => this.getConsKey(cons));
        return arrayLikeOr(...archKeys);
    }

    declare consBuf: ConstructorType[];
    declare archKey: Uint32Array;
    constructor(...consVec: ConstructorType[]) {
        const archKey = Architecture.getConsVecKey(...consVec);
        const archKeyStr = archKey.toString();
        const found = Architecture.archCache.get(archKeyStr);
        if (found) return found as Architecture<T>;
        this.consBuf = consVec;
        this.archKey = archKey;
        Architecture.archCache.set(archKeyStr, this);
    }

    static from<T extends ConsTuple = [any, ...any[]]>(...consVec: T) {
        return new Architecture(...consVec) as Architecture<InstanceIntersection<T>>;
    }

    private _mixin: any;
    public mixin(): ConstructorType<
        T & {
            consBuf: ConstructorType[];
            archKey: ArchKey;
        }
    > {
        if (this._mixin) return this._mixin;
        const buf = this.consBuf;
        const archKey = this.archKey;
        const self = this;
        return applyMixins(
            class extends ArchMixin {
                consBuf = buf;
                archKey = archKey;
                architecture = self;
            },
            buf,
        ) as unknown as ConstructorType<
            T & {
                consBuf: ConstructorType[];
                archKey: ArchKey;
            }
        >;
    }

    public includes(other: Architecture) {
        const otherKey = other.archKey;
        const or = arrayLikeOr(this.archKey, otherKey);
        return or.toString() === otherKey.toString();
    }

    public extends(other: Architecture): other is Architecture<T> {
        const otherKey = other.archKey;
        const or = arrayLikeOr(this.archKey, otherKey);
        return or.toString() === this.archKey.toString();
    }

    partialCmp(other: Architecture) {
        const thisKey = this.archKey;
        const otherKey = other.archKey;
        const orStr = arrayLikeOr(thisKey, otherKey).toString();
        const thisKeyStr = thisKey.toString();
        const otherKeyStr = otherKey.toString();
        if (thisKeyStr === otherKeyStr) return Ordering.Equal;
        else if (orStr === thisKeyStr) return Ordering.Less;
        else if (orStr === otherKeyStr) return Ordering.Greater;
        return undefined;
    }
}
