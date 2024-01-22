export type Index = string | number | symbol;
export type Primitive = Index | boolean | undefined | bigint;
export type Scalar = {
    [index: Index]: Primitive | Primitive[] | Scalar;
};
export type Concrete<T extends abstract new (...args: any[]) => any> = T extends
    abstract new (...args: infer Args) => infer Inst ? new (...args: Args) => Inst : never;
