import { Primitive } from "../../../core/src/lib.ts";

export type Index = string | number;
export type Struct = {
    [index: Index]: Primitive | Primitive[] | Struct;
};

export type Concrete<T extends abstract new(...args: any[]) => any> = T extends
    abstract new(...args: infer Args) => infer Inst ? new(...args: Args) => Inst : never;
