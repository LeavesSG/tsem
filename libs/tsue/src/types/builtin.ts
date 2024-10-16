import { TypeOf } from "./typeof.ts";

export type WrappedConsOf<T> = TypeOf<T> extends keyof WrappedObjDict ? WrappedObjDict[TypeOf<T>] : never;

export interface WrappedObjDict {
    string: StringConstructor;
    number: NumberConstructor;
    symbol: SymbolConstructor;
    boolean: BooleanConstructor;
    bigint: BigIntConstructor;
    obj: ObjectConstructor;
    function: FunctionConstructor;
}

export interface BuiltinCons {
    date: DateConstructor;
    array: ArrayConstructor;
}

type ValueOf<T> = T[keyof T];

export type ConsOf<T> = ValueOf<
    {
        [K in keyof BuiltinCons as T extends InstanceType<BuiltinCons[K]> ? K : never]: BuiltinCons[K];
    }
>;
