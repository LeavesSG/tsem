import { Pattern } from "./pattern.ts";
import { ArrayPattern } from "./variants/array.ts";
import { ConstructorPattern } from "./variants/constructor.ts";
import { LiteralPattern } from "./variants/literal.ts";
import { MatchFuncPattern } from "./variants/match-func.ts";
import { PrimitivePattern, PrimitiveStr } from "./variants/primitive.ts";
import { RegExpPattern } from "./variants/regexp.ts";
import { StructPattern } from "./variants/struct.ts";
import { TuplePattern } from "./variants/tuple.ts";
import { UnionPattern } from "./variants/union.ts";

export enum PatternType {
    Primitive = "primitive",
    RegExp = "regexp",
    Constructor = "constructor",
    MatchFunc = "matchfunc",
    Array = "array",
    Tuple = "tuple",
    Union = "union",
    Struct = "struct",
    Literal = "literal",
}

export type PatternVariant =
    | PrimitivePattern
    | RegExpPattern
    | ConstructorPattern
    | MatchFuncPattern
    | ArrayPattern
    | TuplePattern
    | UnionPattern
    | StructPattern
    | LiteralPattern;

export type PatternBuf<T extends PatternType> = {
    [PatternType.Array]: Pattern;
    [PatternType.Constructor]: ConstructorPattern;
    [PatternType.Literal]: unknown;
    [PatternType.MatchFunc]: MatchFuncPattern;
    [PatternType.Primitive]: PrimitiveStr;
    [PatternType.RegExp]: RegExp;
    [PatternType.Struct]: Record<string, Pattern>;
    [PatternType.Tuple]: Pattern[];
    [PatternType.Union]: Pattern[];
}[T];
