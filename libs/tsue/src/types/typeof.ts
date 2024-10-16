import { PrimitiveTypeDict } from "./primitive.ts";

export interface TypeOfDict extends PrimitiveTypeDict {
    object: object;
    function: (...args: any[]) => any;
}

export type TypeOf<T> = T extends (...args: any[]) => any ? "function" : keyof {
    [K in keyof TypeOfDict as T extends TypeOfDict[K] ? K : never]: never;
};
