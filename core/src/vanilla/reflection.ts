import type { TypeOf } from "./typeof.ts";

export type WrappedConsOf<T> = TypeOf<T> extends keyof WrappedObjReflections
    ? WrappedObjReflections[TypeOf<T>]
    : never;

export interface WrappedObjReflections {
    string: StringConstructor;
    number: NumberConstructor;
    symbol: SymbolConstructor;
    boolean: BooleanConstructor;
    bigint: BigIntConstructor;
    obj: ObjectConstructor;
    function: FunctionConstructor;
}

export interface BuiltinCtorReflections {
    date: DateConstructor;
    array: ArrayConstructor;
}

type ValueOf<T> = T[keyof T];

export type ConsOf<T> = ValueOf<
    {
        [
            K in keyof BuiltinCtorReflections as T extends
                InstanceType<BuiltinCtorReflections[K]> ? K : never
        ]: BuiltinCtorReflections[K];
    }
>;
