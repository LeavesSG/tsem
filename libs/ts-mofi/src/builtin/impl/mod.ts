import { ConstructorType } from "../../types/cons.ts";
import { bound, expr } from "../builtin.ts";

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

    getOrInitImpl(prototype: object) {
        const mayExistedImpl = this.proto2ImplObj.get(prototype);
        if (mayExistedImpl) return mayExistedImpl;
        const impl = {};
        this.proto2ImplObj.set(prototype, impl);
        this.implProxy2Proto.set(impl, prototype);
        return impl;
    }

    getOrInitImplProxy(impl: object) {
        const mayExistedProxy = this.proto2ImplProxy.get(impl);
        if (mayExistedProxy) return mayExistedProxy;
        const proxy = new Proxy(impl, this.implProxyHandler);
        this.proto2ImplProxy.set(impl, proxy);
        this.implProxies.add(proxy);
        return proxy;
    }

    impl<T, U>(target: ConstructorType<T>, implObj: U & ThisType<T>) {
        const prototype = target.prototype;
        const impl = this.getOrInitImpl(prototype);
        Object.assign(impl, implObj);
    }

    withImpl<T extends object>(obj: T): WithImpl<T> {
        const getOrInitImplProxy = this.getOrInitImplProxy.bind(this);
        const getOrInitImpl = this.getOrInitImpl.bind(this);
        this.updateImplProtoChain(obj);
        return new Proxy(obj, {
            get(target, p, receiver) {
                if (Object.hasOwn(target, p)) return Reflect.get(target, p, receiver);
                const implProxy = getOrInitImplProxy(getOrInitImpl(Object.getPrototypeOf(target)));
                return Reflect.get(implProxy, p, receiver);
            },
        }) as WithImpl<T>;
    }

    isImlProxy(obj: object) {
        return this.implProxies.has(obj);
    }

    updateImplProtoChain(impl: object) {
        let ptr = impl;
        while (ptr) {
            const prototype = Object.getPrototypeOf(ptr);
            if (!prototype) break;
            if (this.isImlProxy(prototype)) {
                ptr = prototype;
                continue;
            }
            const implProxy = this.getOrInitImplProxy(this.getOrInitImpl(prototype));
            Object.setPrototypeOf(ptr, implProxy);
            Object.setPrototypeOf(implProxy, Object.getPrototypeOf(prototype));
        }
    }
}

export const SYMBOL_IMPL = Symbol("impl marker");

export type MarkImpl<Traits> = {
    [SYMBOL_IMPL]: Traits;
};

export type WithImpl<T> = T extends MarkImpl<infer R> ? T & R : T;

const GLOBAL_IMPL_CTX = new ImplCtx();
export const { impl, withImpl } = bound(GLOBAL_IMPL_CTX);
