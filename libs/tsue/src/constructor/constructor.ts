export type ConstructorType<R = unknown, Args extends never[] = []> = new(...args: Args) => R;

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
