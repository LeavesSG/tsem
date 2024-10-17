export type EnumVal = string | number;
export type EnumKey = string;
export type RawEnum = Record<EnumKey, EnumVal>;

export type IEnum<T extends RawEnum = RawEnum> = {
    [K in T[keyof T]]: unknown;
};
