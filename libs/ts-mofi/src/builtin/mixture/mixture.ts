// import { InstanceIntersection } from "../../types/cons.ts";
// import { ConstructorType } from "../../types/mod.ts";
// import { PHANTOM_MARKER, PhantomData } from "../../types/phantom.ts";
// import { applyMixins } from "../../utils/mixin.ts";
// import { todo } from "../dev.ts";
// import { MCtxMixKey } from "./arch.ts";
// import { IngredientIdRes } from "./ing-id-res.ts";

import { ConstructorType, InstanceIntersection } from "../../types/cons.ts";
import { PHANTOM_MARKER, PhantomData } from "../../types/phantom.ts";
import { applyMixins } from "../../utils/mixin.ts";
import { todo } from "../dev.ts";
import { MCtxMixKey } from "./arch.ts";
import { IngredientIdRes } from "./ing-id-res.ts";

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
        const found = this.ingredientMap.get(ctor)?.distribute();
        if (!found) return this.initIngId(ctor, referrer);
        switch (found.variant) {
            case "Direct":
                return found.value;
            case "Shallow":
                found.value.forEach(ctor => this.updateReferrerId(ctor));
                return this.initIngId(ctor);
        }
    }

    initIngId(_ctor: ConstructorType, _referrer?: ConstructorType) {
        // const referred = this.ingredientReferenced.get(ctor);
        // if (referred) {
        //     const newId = this.ingredientId++;
        //     this.ingredientMap.set(ctor, newId);
        //     this.updateReferrerId(referred, ctor);
        //     return newId;
        // } else if (referrer) {
        //     this.ingredientReferenced.set(ctor, referrer);
        // }
        // return void 0;
        return todo();
    }

    updateReferrerId(_ctor: ConstructorType) {
        // this.mixtureMap.delete(ctor);
        // this.mixtureMap.set(ctor, this.getMixKey(ctor));
        // const parent = Object.getPrototypeOf(ctor);
        // if (parent === dest) return;
        // if (parent instanceof Mixture && parent.constructors.includes(dest)) return;
        // this.updateReferrerId(parent, dest);
        return todo();
    }

    mixtureMap = new WeakMap<ConstructorType, MCtxMixKey>();
    getMixKey(ctor: ConstructorType) {
        const found = this.mixtureMap.get(ctor);
        if (found) return found;
        return todo();
    }

    getMixtureMixKey(_mixture: Mixture) {
        // const ctx = mixture.context;
        // const ctors = mixture.constructors;
        // const mixKey = ctors.reduce((a, c) => {
        //     const key = ctx.getMixKey(c);
        //     return a | key;
        // }, BigInt(0));
        // return mixKey;
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

export interface UniqMixture<T = unknown, Ctx extends WeakKey = typeof self> {
    new(...args: never[]): T & UniqMixture<T>;
}

export class UniqMixture<T = unknown, Ctx extends WeakKey = typeof self> {
    declare [PHANTOM_MARKER]: PhantomData<[T, Ctx]>;
    declare constructors: ConstructorType[];
    declare context: MixtureCtx;

    static mixtureContext = new WeakMap<WeakKey, MixtureCtx>();

    constructor(ctors: ConstructorType[] = [], ctx: WeakKey = self) {
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
            declare static [PHANTOM_MARKER]: PhantomData<[T, Ctx]>;
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
    static from<T extends ConstructorType[] = [], Ctx extends WeakKey = typeof self>(
        ctors: [...T],
        ctx?: Ctx,
    ) {
        return new this<InstanceIntersection<T>, Ctx>(ctors, ctx);
    }

    mix<U extends ConstructorType[]>(...others: U): UniqMixture<T & InstanceIntersection<U>, Ctx> {
        const cons = (this as object).constructor as typeof UniqMixture;
        return new cons([...this.constructors, ...others], this.context);
    }
}

export interface Mixture<T = unknown> {
    new(...args: never[]): T & Mixture<T>;
}

const SYMBOL_MIXTURE = Symbol("mixture");
export class Mixture<T = unknown> {
    declare [PHANTOM_MARKER]: PhantomData<T>;
    declare constructors: Set<ConstructorType>;
    constructor(...ctors: ConstructorType[]) {
        const constructors = new Set(ctors.map(c => [...flatPrototype(c)]).flat());

        class MixedMixture {
            declare static [PHANTOM_MARKER]: PhantomData<T>;
            static constructors = constructors;
            static [SYMBOL_NON_INGREDIENT] = true;
            static [SYMBOL_MIXTURE] = true;
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
    static from<T extends ConstructorType[] = []>(
        ...ctors: [...T]
    ) {
        return new this<InstanceIntersection<T>>(...ctors);
    }

    mix<U extends ConstructorType[]>(...others: U): Mixture<T & InstanceIntersection<U>> {
        const cons = (this as object).constructor as typeof Mixture;
        return new cons(...this.constructors, ...others);
    }

    union(ctor: ConstructorType) {
        const mix = Mixture.from(ctor);
        return this.constructors.union(mix.constructors);
    }

    intersection(ctor: ConstructorType) {
        const mix = Mixture.from(ctor);
        return this.constructors.intersection(mix.constructors);
    }

    equals(ctor: ConstructorType) {
        const intersection = this.intersection(ctor);
        const union = this.union(ctor);
        return intersection.size === union.size;
    }
}

function* flatPrototype(ctor: ConstructorType) {
    let ptr = ctor;
    while (ptr) {
        if (ptr instanceof Mixture) yield* ptr.constructors;
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
