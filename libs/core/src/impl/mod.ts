/**
 * This module contains feature of runtime implementation for classes.
 * @module
 */

import { bound, expr } from "../utils/mod.ts";
import type { ConstructorType } from "../vanilla/mod.ts";

/**
 * Implementation context. Implementations are registered inside the scope and could only
 * be accessed within the scope. A default global scope is exported. It recommended to use
 * to use the default scope in most cases.
 * This is a runtime feature, it will need some declarations from user to provide type inference
 * and annotation. See example for details.
 *
 * @example
 * ```ts
 * const ctx = GLOBAL_IMPL_CTX;
 * interface Cmp {
 *    cmp(other: this): -1 | 0 | 1;
 * }
 * declare global {
 *    // this will allow to define implementation elsewhere.
 *    interface DateImpl extends Cmp {}
 *    interface Date extends DateImpl {}
 * }
 * ctx.impl(Date, {
 *    cmp(other: Date): -1 | 0 | 1 {
 *        if (this.getTime() > other.getTime()) return 1;
 *        else if (other.getTime() > this.getTime()) return -1;
 *        return 0;
 *    },
 * });
 * ctx.withImpl(new Date("2024-01-01")).cmp(new Date("2024-1-1"));
 * ```
 */
export class ImplCtx {
    private proto2ImplObj = new WeakMap();
    private proto2ImplProxy = new WeakMap();
    private implProxy2Proto = new WeakMap();
    private implProxies = new Set();
    private implProxyHandler = expr(() => {
        const reflect = this.implProxy2Proto;
        return {
            get(target: object, p: string, receiver: object) {
                const reflection = reflect.get(target)!;
                if (!Object.hasOwn(target, p) && Object.hasOwn(reflection, p)) {
                    return Reflect.get(reflection, p, receiver);
                }
                return Reflect.get(target, p, receiver);
            },
        };
    });

    private getOrInitImpl(prototype: object) {
        const mayExistedImpl = this.proto2ImplObj.get(prototype);
        if (mayExistedImpl) return mayExistedImpl;
        const impl = {};
        this.proto2ImplObj.set(prototype, impl);
        this.implProxy2Proto.set(impl, prototype);
        return impl;
    }

    private getOrInitImplProxy(impl: object) {
        const mayExistedProxy = this.proto2ImplProxy.get(impl);
        if (mayExistedProxy) return mayExistedProxy;
        const proxy = new Proxy(impl, this.implProxyHandler);
        this.proto2ImplProxy.set(impl, proxy);
        this.implProxies.add(proxy);
        return proxy;
    }

    /**
     * Implement features for target constructor.
     * @param target target constructor (or an object with `prototype` property).
     * @param implObj object contains implementation methods.
     */
    public impl<T, U>(target: ConstructorType<T>, implObj: U & ThisType<T>) {
        const prototype = target.prototype;
        const impl = this.getOrInitImpl(prototype);
        Object.assign(impl, implObj);
    }

    /**
     * A proxy of object, that contains all methods implemented for its contructor (or prototype).
     * @param obj target object.
     */
    public withImpl<T extends object>(obj: T): WithImpl<T> {
        const getOrInitImplProxy = this.getOrInitImplProxy.bind(this);
        const getOrInitImpl = this.getOrInitImpl.bind(this);
        this.updateImplProtoChain(obj);
        return new Proxy(obj, {
            get(target, p, receiver) {
                if (Object.hasOwn(target, p)) {
                    return Reflect.get(target, p, receiver);
                }
                const implProxy = getOrInitImplProxy(
                    getOrInitImpl(Object.getPrototypeOf(target)),
                );
                return Reflect.get(implProxy, p, receiver);
            },
        }) as WithImpl<T>;
    }

    private isImlProxy(obj: object) {
        return this.implProxies.has(obj);
    }

    private updateImplProtoChain(impl: object) {
        let ptr = impl;
        while (ptr) {
            const prototype = Object.getPrototypeOf(ptr);
            if (!prototype) break;
            if (this.isImlProxy(prototype)) {
                ptr = prototype;
                continue;
            }
            const implProxy = this.getOrInitImplProxy(
                this.getOrInitImpl(prototype),
            );
            Object.setPrototypeOf(ptr, implProxy);
            Object.setPrototypeOf(implProxy, Object.getPrototypeOf(prototype));
        }
    }
}

export const SYMBOL_IMPL = Symbol("impl marker");

type MarkImpl<Traits> = {
    [SYMBOL_IMPL]: Traits;
};

type WithImpl<T> = T extends MarkImpl<infer R> ? T & R : T;
export const GLOBAL_IMPL_CTX: ImplCtx = new ImplCtx();

const boundGlobalImpl = bound(GLOBAL_IMPL_CTX);
export const impl: ImplCtx["impl"] = boundGlobalImpl.impl;
export const withImpl: ImplCtx["withImpl"] = boundGlobalImpl.withImpl;
