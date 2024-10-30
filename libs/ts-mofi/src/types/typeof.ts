import { PRIMITIVE_CTOR_DICT, PrimitiveDict } from "./primitive.ts";

export interface TypeOfDict extends PrimitiveDict {
    object: object;
    function: (...args: any[]) => any;
}

export type TypeOfName = keyof TypeOfDict;

export const TYPEOF_CTOR_DICT = {
    ...PRIMITIVE_CTOR_DICT,
    object: Object,
    function: Function,
};

export const TYPEOF_NAMES = Object.keys(TYPEOF_CTOR_DICT) as TypeOfName[];

export type TypeOf<T> = T extends (...args: any[]) => any ? "function" : keyof {
    [K in TypeOfName as T extends TypeOfDict[K] ? K : never]: never;
};

export const isTypeOfNames = (target: unknown): target is TypeOfName => {
    return (TYPEOF_NAMES as unknown[]).includes(target);
};

export const isTypeOf = <T extends TypeOfName>(typeName: T) => {
    return <U>(target: U): target is U & TypeOfDict[T] => {
        return typeName === (typeof target);
    };
};
