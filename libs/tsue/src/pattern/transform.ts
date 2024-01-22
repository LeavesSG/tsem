import { Pattern } from "./pattern.ts";
import { ArrayPattern, FromArrayPattern } from "./variants/array.ts";
import { ConstructorPattern, FromConstructorPattern } from "./variants/constructor.ts";
import { FromLiteralPattern, LiteralPattern } from "./variants/literal.ts";
import { FromMatchFuncPattern, MatchFuncPattern } from "./variants/match-func.ts";
import { FromPrimitivePattern, PrimitivePattern } from "./variants/primitive.ts";
import { FromRegExpPattern, RegExpPattern } from "./variants/regexp.ts";
import { StructPattern } from "./variants/struct.ts";
import { FromTuplePattern, TuplePattern } from "./variants/tuple.ts";
import { FromUnionPattern, UnionPattern } from "./variants/union.ts";

/**
 * Parse an incoming pattern to its guard type. Order is VERY IMPORTANT.
 */
export type FromPattern<T> = T extends Pattern ? T
    : T extends PrimitivePattern ? FromPrimitivePattern<T>
    : T extends RegExpPattern ? FromRegExpPattern
    : T extends ConstructorPattern ? FromConstructorPattern<T>
    : T extends MatchFuncPattern ? FromMatchFuncPattern<T>
    : T extends ArrayPattern ? FromArrayPattern<T>
    : T extends TuplePattern ? FromTuplePattern<T>
    : T extends UnionPattern ? FromUnionPattern<T>
    : T extends StructPattern ? {
            -readonly [K in keyof T]: FromPattern<T[K]>;
        }
    : T extends LiteralPattern ? FromLiteralPattern<T>
    : never;
