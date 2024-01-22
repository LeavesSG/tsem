import { ConstructorType } from "../../constructor/constructor.ts";

export type ConstructorPattern<T = unknown> = ConstructorType<T>;

export type FromConstructorPattern<T extends ConstructorPattern> = T extends
    ConstructorPattern<infer R> ? R : never;

export function isConstructorPattern(val: unknown): val is ConstructorPattern {
    if (typeof val !== "function") return false;
    const cons = val.prototype?.constructor;
    if (!cons) return false;
    try {
        new cons();
        return true;
    } catch (_) {
        return false;
    }
}
