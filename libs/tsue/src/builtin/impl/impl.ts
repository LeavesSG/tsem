import { ConstructorType } from "../../types/mod.ts";
import { todo } from "../dev.ts";

const IMPL_MARKER = Symbol("Implementation Marker");

export interface MarkImpl<Traits> {
    [IMPL_MARKER]: Traits;
}

const implMap = new WeakMap<ConstructorType["prototype"], ConstructorType["prototype"]>();
export function implFor<T>(target: ConstructorType, implObj: T): void {
    const prototype = target.prototype;
    implMap.set(prototype, implObj);
}

export function impl<T>(target: T): Impl<T> {
    const prototype = Object.getPrototypeOf(target);
    const impl = implMap.get(prototype);
    if (!target || typeof target !== "object") throw todo();
    return new Proxy(target, {
        get(target, propKey, reciever) {
        },
    }) as any;
}

export type Impl<T> = T extends MarkImpl<infer R> ? T & R : T;

export type MayImpl<T> = T | MarkImpl<T>;
