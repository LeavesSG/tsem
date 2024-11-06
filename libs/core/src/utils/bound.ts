/**
 * Create a proxy of target object, with all methods bound to itself.
 */
export const bound: <const T extends object>(obj: T) => T = <
    const T extends object,
>(obj: T) =>
    new Proxy(obj, {
        get(target, prop, rec) {
            const res = Reflect.get(target, prop, rec);
            return typeof res === "function" && res.bind(obj) || res;
        },
    });
