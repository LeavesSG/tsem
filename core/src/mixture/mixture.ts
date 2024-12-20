import { type PhantomData, SYMBOL_PHANTOM, todo } from "../shared/mod.ts";
import { applyMixins } from "../utils/mod.ts";
import type { ConstructorArrayOf } from "../vanilla/ctor.ts";
import type { ConstructorType, InstanceArrayOf, InstanceIntersection } from "../vanilla/mod.ts";
import type { MCtxMixKey } from "./arch.ts";
import type { IngredientIdRes } from "./ing-id-res.ts";

export const SYMBOL_NON_INGREDIENT = Symbol(
    "A symbol that stop architecture tracker from tracking the current instance prototype.",
);

export class MixtureCtx {
    /**
     * Return whether a constructor is marked to skip hierarchy tracker.
     */
    nonIngredient(ctor: ConstructorType) {
        return SYMBOL_NON_INGREDIENT in ctor;
    }

    ingredientId = 0;
    ingredientMap = new WeakMap<ConstructorType, IngredientIdRes>();
    /**
     * Get the specific key for a constructor as ingredient forming other ctors.
     * Calling with a "referer" param will considered as referring the given ctor.
     * A ctor will be considered as ingredient **only if** it has been referred twice.
     */
    getIngId(ctor: ConstructorType, referrer?: ConstructorType) {
        const found = this.ingredientMap.get(ctor)?.asADT();
        if (!found) return this.initIngId(ctor, referrer);
        switch (found.variant) {
            case "Direct":
                return found.value;
            case "Shallow":
                found.value.forEach((ctor) => this.updateReferrerId(ctor));
                return this.initIngId(ctor);
        }
    }

    initIngId(_ctor: ConstructorType, _referrer?: ConstructorType) {
        return todo();
    }

    updateReferrerId(_ctor: ConstructorType) {
        return todo();
    }

    mixtureMap = new WeakMap<ConstructorType, MCtxMixKey>();
    getMixKey(ctor: ConstructorType) {
        const found = this.mixtureMap.get(ctor);
        if (found) return found;
        return todo();
    }

    getMixtureMixKey(_mixture: Mixture) {
        return todo();
    }

    mixKeyNeedUpdate(ctor: ConstructorType) {
        const mixKey = this.mixtureMap.get(ctor);
        if (!mixKey) return false;
        return mixKey.toString(2).length - 2 < this.ingredientId;
    }

    architectureMap = new Map<MCtxMixKey, UniqMixture>();
    getCachedArch(mixKye: MCtxMixKey) {
        return this.architectureMap.get(mixKye);
    }
}

export interface UniqMixture<
    T = unknown,
    Ctx extends WeakKey = typeof globalThis,
> {
    new(...args: never[]): T & UniqMixture<T>;
}

export class UniqMixture<T = unknown, Ctx extends WeakKey = typeof globalThis> {
    declare [SYMBOL_PHANTOM]: PhantomData<[T, Ctx]>;
    declare constructors: ConstructorType[];
    declare context: MixtureCtx;

    static mixtureContext = new WeakMap<WeakKey, MixtureCtx>();

    constructor(ctors: ConstructorType[] = [], ctx: WeakKey = globalThis) {
        const context = (() => {
            const found = UniqMixture.mixtureContext.get(ctx);
            if (found) return found;
            const scp = new MixtureCtx();
            UniqMixture.mixtureContext.set(ctx, scp);
            return scp;
        })();
        const mixKey = ctors.reduce((a, c) => {
            const key = context.getMixKey(c);
            return a | key;
        }, BigInt(0));
        const found = context.getCachedArch(mixKey);
        if (found) return found as UniqMixture<T, Ctx>;
        class MixedMixture {
            declare static [SYMBOL_PHANTOM]: PhantomData<[T, Ctx]>;
            static constructors = ctors;
            static [SYMBOL_NON_INGREDIENT] = true;
            static context = context;
        }
        applyMixins(MixedMixture, ctors);
        context.mixtureMap.set(MixedMixture, mixKey);
        return MixedMixture as typeof MixedMixture & UniqMixture<T, Ctx>;
    }

    /**
     * @param ctors constructor types
     */
    static from<
        T extends ConstructorType[] = [],
        Ctx extends WeakKey = typeof globalThis,
    >(
        ctors: [...T],
        ctx?: Ctx,
    ) {
        return new this<InstanceIntersection<T>, Ctx>(ctors, ctx);
    }

    mix<U extends ConstructorType[]>(
        ...others: U
    ): UniqMixture<T & InstanceIntersection<U>, Ctx> {
        const cons = (this as object).constructor as typeof UniqMixture;
        return new cons([...this.constructors, ...others], this.context);
    }
}

export interface Mixture<T extends ConstructorType[] = ConstructorType[]> {
    new(): InstanceIntersection<T> & Mixture<T>;
}

const SYMBOL_MIXTURE = Symbol("mixture");
export class Mixture<T extends ConstructorType[] = ConstructorType[]> {
    declare [SYMBOL_PHANTOM]: PhantomData<InstanceIntersection<T>>;
    declare ctors: T;
    declare ctorSet: Set<T[number]>;
    constructor(...ctors: T) {
        const ctorSet = new Set(
            ctors.map((c) => [...flatPrototype(c)]).flat(),
        );

        class MixedMixture {
            declare static [SYMBOL_PHANTOM]: PhantomData<T>;
            static ctors = ctors;
            static ctorSet = ctorSet;
            static [SYMBOL_NON_INGREDIENT] = true;
            static [SYMBOL_MIXTURE] = true;
            constructor(...instances: InstanceArrayOf<T>) {
                Object.assign(this, ...instances);
            }
        }
        applyMixins(MixedMixture, [...ctors, Mixture]);
        return applyOrigin(MixedMixture, Mixture) as any;
    }

    static [Symbol.hasInstance](instance: any): instance is Mixture {
        return SYMBOL_MIXTURE in instance;
    }

    /**
     * @param ctors constructor types
     */
    static from<T extends object[] = []>(
        ...instances: T
    ): Mixture<ConstructorArrayOf<T>> {
        const ctors = instances.map(instance => instance.constructor as ConstructorType);
        const ctor = new this(...ctors);
        // @ts-ignore <To complex for tsc to understand what's happenning here.>
        return new ctor(...instances);
    }

    mix<U extends ConstructorType[]>(
        ...others: U
    ): Mixture<[...T, ...U]> {
        const cons = this.constructor as typeof Mixture;
        return new cons<[...T, ...U]>(...this.ctors, ...others);
    }

    ctorUnion(ctor: ConstructorType): Set<ConstructorType> {
        const mix = new Mixture(ctor);
        return this.ctorSet.union(mix.ctorSet);
    }

    ctorIntxt(ctor: ConstructorType): Set<ConstructorType> {
        const mix = new Mixture(ctor);
        return this.ctorSet.intersection(mix.ctorSet);
    }

    equals(ctor: ConstructorType): boolean {
        const intersection = this.ctorIntxt(ctor);
        const union = this.ctorUnion(ctor);
        return intersection.size === union.size;
    }
}

function* flatPrototype(ctor: ConstructorType) {
    let ptr = ctor;
    while (ptr) {
        if (ptr instanceof Mixture) yield* ptr.ctors;
        if (!(SYMBOL_NON_INGREDIENT in ptr)) yield ptr;
        ptr = Object.getPrototypeOf(ptr);
    }
}

function applyOrigin<T, U extends ConstructorType>(target: T, source: U) {
    Object.getOwnPropertyNames(source.prototype).forEach((name) => {
        Object.defineProperty(
            target,
            name,
            Object.getOwnPropertyDescriptor(source.prototype, name)
                || Object.create(null),
        );
    });
    return target as T & InstanceType<U>;
}
