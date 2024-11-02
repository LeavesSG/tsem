import { todo } from "../dev.ts";
import { UniqMixture } from "../mixture/mixture.ts";

const PROTO_PROXY = new WeakMap();
const PROTO_IMPL = new WeakMap<WeakKey, UniqMixture>();
export function impl<T, U>(target: T, implObj: U & ThisType<T>) {
    const proto = Object.getPrototypeOf(target);
    const protoProxy = PROTO_PROXY.get(proto) ?? new Proxy(proto, {
        get(target, p, receiver) {
            const found = Reflect.get(target, p, receiver);
            if (found) return found;
            const implObj = PROTO_IMPL.get(proto);
            if (!implObj) return found;
            return (implObj as any)[p];
        },
    });
    PROTO_PROXY.set(proto, protoProxy);
    return todo();
}
