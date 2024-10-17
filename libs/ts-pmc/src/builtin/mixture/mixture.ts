import { InstanceIntersection } from "../../types/cons.ts";
import { ConstructorType } from "../../types/mod.ts";
import { PHANTOM_MARKER, PhantomData } from "../../types/phantom.ts";
import { applyMixins } from "../../utils/mixin.ts";
import { todo } from "../dev.ts";
import { MCtxCtorId, MCtxIngId, MCtxMixKey } from "./arch.ts";

export const SKIP_MIXTURE_TRACKING = Symbol(
    "A symbol that stop architecture tracker from tracking the current instance prototype.",
);

export class MixtureCtx {
    /**
     * Return whether a constructor is marked to skip hierarchy tracker.
     */
    shouldSkip(ctor: ConstructorType) {
        return SKIP_MIXTURE_TRACKING in ctor;
    }

    ctorsMap = new WeakMap<ConstructorType, MCtxCtorId>();
    ctorsId = 0;
    /**
     * Get a unique id for a specific constructor.
     */
    getCtorId(ctor: ConstructorType) {
        const found = this.ctorsMap.get(ctor);
        if (found) return found;
        return this.initCtorId(ctor);
    }
    initCtorId(ctor: ConstructorType): MCtxCtorId {
        const newId = this.ctorsId++;
        this.ctorsMap.set(ctor, newId);
        return newId;
    }

    ingredientId = 0;
    ingredientMap = new WeakMap<ConstructorType, MCtxIngId>();
    ingredientReferredOnce = new WeakMap<ConstructorType, ConstructorType>();
    /**
     * Get the specific key for a constructor as ingredient forming other ctors.
     * Calling with a "referer" param will considered as referring the given ctor.
     * A ctor will be considered as ingredient **only if** it has been referred twice.
     */
    getIngId(ctor: ConstructorType, referrer?: ConstructorType) {
        const found = this.ingredientMap.get(ctor);
        if (found) return found;
        return this.initIngId(ctor, referrer);
    }

    initIngId(ctor: ConstructorType, referrer?: ConstructorType) {
        const referred = this.ingredientReferredOnce.get(ctor);
        if (referred) {
            const newId = this.ingredientId++;
            this.ingredientMap.set(ctor, newId);
            this.updateReferrerId(referred, ctor);
            return newId;
        } else if (referrer) {
            this.ingredientReferredOnce.set(ctor, referrer);
        }
        return void 0;
    }

    updateReferrerId(ctor: ConstructorType, dest: ConstructorType) {
        this.mixtureMap.delete(ctor);
        this.mixtureMap.set(ctor, this.getMixKey(ctor));
        const parent = Object.getPrototypeOf(ctor);
        if (parent === dest) return;
        if (parent instanceof Mixture && parent.constructors.includes(dest)) return;
        this.updateReferrerId(parent, dest);
    }

    mixtureMap = new WeakMap<ConstructorType, MCtxMixKey>();
    getMixKey(ctor: ConstructorType) {
        const found = this.mixtureMap.get(ctor);
        if (found) return found;
        return todo();
    }

    getMixtureMixKey(mixture: Mixture) {
        const ctx = mixture.context;
        const ctors = mixture.constructors;
        const mixKey = ctors.reduce((a, c) => {
            const key = ctx.getMixKey(c);
            return a | key;
        }, BigInt(0));
        return mixKey;
    }

    mixKeyNeedUpdate(ctor: ConstructorType) {
        const mixKey = this.mixtureMap.get(ctor);
        if (!mixKey) return false;
        return mixKey.toString(2).length - 2 < this.ingredientId;
    }

    architectureMap = new Map<MCtxMixKey, Mixture>();
    getCachedArch(mixKye: MCtxMixKey) {
        return this.architectureMap.get(mixKye);
    }
}

export interface Mixture<T = unknown, Ctx extends WeakKey = typeof self> {
    new(...args: never[]): T;
}

export class Mixture<T = unknown, Ctx extends WeakKey = typeof self> {
    declare [PHANTOM_MARKER]: PhantomData<[T, Ctx]>;
    declare constructors: ConstructorType[];
    declare context: MixtureCtx;

    static mixtureContext = new WeakMap<WeakKey, MixtureCtx>();

    constructor(ctors: ConstructorType[] = [], ctx: WeakKey = self) {
        const context = (() => {
            const found = Mixture.mixtureContext.get(ctx);
            if (found) return found;
            const scp = new MixtureCtx();
            Mixture.mixtureContext.set(ctx, scp);
            return scp;
        })();
        const mixKey = ctors.reduce((a, c) => {
            const key = context.getMixKey(c);
            return a | key;
        }, BigInt(0));
        const found = context.getCachedArch(mixKey);
        if (found) return found as Mixture<T, Ctx>;
        class MixedMixture {
            declare static [PHANTOM_MARKER]: PhantomData<[T, Ctx]>;
            static constructors = ctors;
            static [SKIP_MIXTURE_TRACKING] = true;
            static context = context;
        }
        applyMixins(MixedMixture, ctors);
        context.mixtureMap.set(MixedMixture, mixKey);
        return MixedMixture as typeof MixedMixture & Mixture<T, Ctx>;
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
}
