// deno-lint-ignore-file no-explicit-any ban-types
export type ConstructorType<I = any, Args extends any[] = []> = new(...args: Args) => I;
export type ConsTuple = [ConstructorType, ...ConstructorType[]];
export type InstanceIntersection<T extends ConstructorType[], __O = {}> = T extends
    [infer C1 extends ConstructorType, ...infer CR extends ConstructorType[]]
    ? InstanceIntersection<CR, __O & InstanceType<C1>>
    : __O;

export function isConstructor(fn: unknown): fn is ConstructorType {
    if (typeof fn !== "function") return false;
    const cons = fn.prototype?.constructor;
    if (!cons) return false;
    try {
        new cons();
        return true;
    } catch (_) {
        return false;
    }
}
