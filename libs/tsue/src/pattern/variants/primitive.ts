export type PrimitiveStr =
    | "boolean"
    | "number"
    | "string"
    | "bigint"
    | "symbol";

export type PrimitiveCons =
    | BooleanConstructor
    | NumberConstructor
    | StringConstructor
    | BigIntConstructor
    | SymbolConstructor;

export type PrimitiveType = boolean | number | string | bigint | symbol;

export type PrimitivePattern = PrimitiveStr | PrimitiveCons;

export type FromPrimitivePattern<T extends PrimitivePattern> = T extends
    "boolean" | BooleanConstructor ? boolean
    : T extends "number" | NumberConstructor ? number
    : T extends "string" | StringConstructor ? string
    : T extends "bigint" | BigIntConstructor ? bigint
    : T extends "symbol" | SymbolConstructor ? symbol
    : never;

export const PrimitiveStrDict = {
    boolean: Boolean,
    number: Number,
    string: String,
    bigint: BigInt,
    symbol: Symbol,
};

export function isPrimitivePattern(buf: unknown): buf is PrimitivePattern {
    return Object.entries(PrimitiveStrDict).some(([key, value]) => buf === key || buf === value);
}
