export function tryAwait<T>(empty: undefined): Promise<T>;
export function tryAwait<T>(promise: Promise<T>): Promise<T>;
export function tryAwait<T>(queue: Iterable<Promise<T>>): Promise<T>;
export function tryAwait(param: unknown) {
    if (typeof param !== "object" || !param) return void 0;
    if (param instanceof Promise) {
        return param;
    } else if (
        param instanceof Array || param instanceof Map || param instanceof Set ||
        Symbol.iterator in param
    ) {
        return Promise.all(param as Iterable<unknown>);
    }
    return;
}
