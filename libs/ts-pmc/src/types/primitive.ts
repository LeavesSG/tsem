export interface PrimitiveTypeDict {
    boolean: boolean;
    string: string;
    number: number;
    bigint: bigint;
    undefined: undefined;
    symbol: symbol;
}
export type PrimitiveTypeName = keyof PrimitiveTypeDict;
export type Primitive = PrimitiveTypeDict[PrimitiveTypeName];

export const PRIMITIVE_TYPE_DICT = {
    boolean: Boolean,
    string: String,
    number: Number,
    bigint: BigInt,
    undefined: undefined,
    symbol: Symbol,
};
export const PRIMITIVE_TYPE_NAME = Object.keys(PRIMITIVE_TYPE_DICT);

export const isPrimitiveTypeName = (target: unknown): target is keyof PrimitiveTypeDict => {
    return typeof target === "string" && target in PRIMITIVE_TYPE_DICT;
};

export const isPrimitiveType = (target: unknown): target is Primitive => {
    return PRIMITIVE_TYPE_NAME.includes(typeof target);
};
