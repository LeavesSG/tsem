export interface PrimitiveDict {
    boolean: boolean;
    string: string;
    number: number;
    bigint: bigint;
    undefined: undefined;
    symbol: symbol;
}
export type PrimitiveName = keyof PrimitiveDict;
export type PrimitiveType = PrimitiveDict[PrimitiveName];

export const PRIMITIVE_CTOR_DICT = {
    boolean: Boolean,
    string: String,
    number: Number,
    bigint: BigInt,
    symbol: Symbol,
    undefined: undefined,
};
export const PRIMITIVE_NAMES = Object.keys(PRIMITIVE_CTOR_DICT);

export const isPrimitiveName = (target: unknown): target is PrimitiveName => {
    return typeof target === "string" && target in PRIMITIVE_CTOR_DICT;
};

export const isPrimitive = (target: unknown): target is PrimitiveType => {
    return PRIMITIVE_NAMES.includes(typeof target);
};

export const isPrimitiveType = <T extends PrimitiveName>(typeName: T) => {
    return (target: unknown): target is PrimitiveDict[T] => {
        return typeName === (typeof target);
    };
};
