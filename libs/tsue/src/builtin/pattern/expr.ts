import { ConsOf, WrappedConsOf } from "../../types/builtin.ts";
import { ConstructorType, PrimitiveTypeDict, PrimitiveTypeName } from "../../types/mod.ts";
import { TypeOf } from "../../types/typeof.ts";
import { UnknownMaker } from "./markers.ts";
import { Pattern } from "./obj.ts";

export enum PatExpr {
    /** Expr that matches a primitive value, with expr as its type string. */
    Primitive,
    /** Expr that is a PatternObject, match value that pass its `match` methods. */
    PatObj,
    /** Expr that matches a tuple type, with each corresponding member also matched. */
    Tuple,
    /** Expr that matches any value. */
    Unknown,
    /** Expr that matches a constructor instance, with expr as its constructor type. */
    Constructor,
    /** Expr that matches a struct type, with value in each corresponding KV pairs also matched. */
    Struct,
    /** Expr that match value strictly equals itself. */
    Literal,
}

export interface PatExprForm {
    [PatExpr.Primitive]: PrimitiveTypeName;
    [PatExpr.Tuple]: unknown[];
    [PatExpr.Constructor]: ConstructorType;
    [PatExpr.Unknown]: UnknownMaker;
    [PatExpr.Struct]: Record<string, unknown>;

    [PatExpr.Literal]: unknown;

    [PatExpr.PatObj]: Pattern;
}

export interface PatExprParser<T> {
    [PatExpr.Primitive]: T extends PrimitiveTypeName ? PrimitiveTypeDict[T] : never;
    [PatExpr.Tuple]: T extends unknown[] ? ParseTuplePatExpr<T> : never;
    [PatExpr.Struct]: T extends Record<string, unknown> ? ParseStructPatExpr<T> : never;

    [PatExpr.Constructor]: T extends ConstructorType<infer R> ? R : never;
    [PatExpr.PatObj]: T extends Pattern<infer R> ? R : never;
    [PatExpr.Unknown]: T extends UnknownMaker ? unknown : never;
    [PatExpr.Literal]: T;
}

export type PatExpressions = PatExprForm[PatExpr];

export type PatExprParseSeries = [
    PatExpr.PatObj,
    PatExpr.Unknown,
    PatExpr.Primitive,
    PatExpr.Constructor,
    PatExpr.Tuple,
    PatExpr.Struct,
];

export type MatchPatExprVariant<
    T,
    U = PatExprParseSeries,
> = U extends [
    infer S extends PatExpr,
    ...infer Rest extends PatExpr[],
] ? T extends PatExprForm[S] ? S : MatchPatExprVariant<T, Rest>
    : PatExpr.Literal;

export type ParsePatExpr<T> = PatExprParser<T>[MatchPatExprVariant<T>];

export type ParseTuplePatExpr<T extends unknown[]> = T extends [infer R, ...infer Rest extends unknown[]]
    ? [ParsePatExpr<R>, ...ParseTuplePatExpr<Rest>]
    : [];

export type ParseStructPatExpr<T extends Record<string, unknown>> = {
    [K in keyof T]: ParsePatExpr<T[K]>;
};

export interface CommonPatExprDict<T = unknown> {
    [PatExpr.Primitive]: TypeOf<T> | WrappedConsOf<T>;
    [PatExpr.Tuple]: PossibleTupleExpr<T>;
    [PatExpr.Struct]: PossibleStructExpr<T>;
    [PatExpr.Literal]: T;
}

export interface PossiblePatExprDict<T = unknown> extends CommonPatExprDict<T> {
    [PatExpr.Constructor]: Extract<T, object> extends infer R extends object ? ConstructorType<R> : never | ConsOf<T>;
    [PatExpr.Unknown]: UnknownMaker;
    [PatExpr.PatObj]: Pattern<T>;
    Array: T extends any[] ? Pattern<T[number][]> : never;
}

export type PossiblePatExpr<T> = PossiblePatExprDict<T>[keyof PossiblePatExprDict];
export type CommonPatExpr<T> = CommonPatExprDict<T>[keyof CommonPatExprDict];
export type LiteralPatExpr<T> = CommonPatExprDict<T>[PatExpr.Literal];
type PossibleTupleExpr<T, __R = never> = T extends [...infer R, any[]] ? PossiblePatExpr<R> : __R;
type PossibleStructExpr<T> = T extends Record<string, unknown> ? {
        [K in keyof T]: PossiblePatExpr<T[K]>;
    }
    : never;
