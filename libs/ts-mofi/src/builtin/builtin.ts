export const expr = <const T extends any[]>(...expr: [...T]): Expr<T> => {
    return expr.reduce((_, c: unknown) => {
        if (typeof c === "function" && c.length === 0) return c();
        return c;
    }, undefined);
};

type Expr<T extends any[], _R = never> = T extends [infer C, ...infer R extends any[]]
    ? Expr<R, (C extends () => infer Res ? Res : C)>
    : _R;

export const bound = <const T extends object>(obj: T) =>
    new Proxy(obj, {
        get(target, prop, rec) {
            const res = Reflect.get(target, prop, rec);
            return typeof res === "function" && res.bind(obj) || res;
        },
    });
