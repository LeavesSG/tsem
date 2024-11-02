import { ConstructorType } from "../../types/cons.ts";
import { expr } from "../builtin.ts";

export class ImplCtx {
    private protoImpl = new WeakMap();
    private protoImplProxy = new WeakMap();
    private protoImplReflection = new WeakMap();
    private implProxies = new Set();
    private implProxyHandler = expr(() => {
        const reflect = this.protoImplReflection;
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
        const mayExistedImpl = this.protoImpl.get(prototype);
        if (mayExistedImpl) return mayExistedImpl;
        const impl = {};
        this.protoImpl.set(prototype, impl);
        this.protoImplReflection.set(impl, prototype);
        return impl;
    }

    getOrInitImplProxy(impl: object) {
        const mayExistedProxy = this.protoImplProxy.get(impl);
        if (mayExistedProxy) return mayExistedProxy;
        const proxy = new Proxy(impl, this.implProxyHandler);
        this.protoImplProxy.set(impl, proxy);
        this.implProxies.add(proxy);
        return proxy;
    }

    impl<T extends ConstructorType, U>(target: T, implObj: U & ThisType<T>) {
        const prototype = target.prototype;
        const impl = this.getOrInitImpl(prototype);
        Object.assign(impl, implObj);
    }

    getImpl(obj: object) {
        const getOrInitImplProxy = this.getOrInitImplProxy.bind(this);
        const getOrInitImpl = this.getOrInitImpl.bind(this);
        this.updateImplProtoChain(obj);
        return new Proxy(obj, {
            get(target, p, receiver) {
                if (Object.hasOwn(target, p)) return Reflect.get(target, p, receiver);
                const implProxy = getOrInitImplProxy(getOrInitImpl(Object.getPrototypeOf(target)));
                return Reflect.get(implProxy, p, receiver);
            },
        });
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
