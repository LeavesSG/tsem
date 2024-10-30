export const isWeakKey = (target: unknown): target is WeakKey => {
    return (typeof target === "object" || typeof target === "function" || typeof target === "symbol")
        && target !== null;
};
