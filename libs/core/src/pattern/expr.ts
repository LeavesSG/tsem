import type { ConstructorType } from "../vanilla/ctor.ts";
import type { ConsOf, WrappedConsOf } from "../vanilla/reflection.ts";
import type { TypeOf, TypeOfDict, TypeOfName } from "../vanilla/typeof.ts";
import type { Pattern } from "./pattern.ts";
import type { ToPattern } from "./to-pattern.ts";

export enum PatExpr {
    /** Expr is a object that implements `ToPattern` interface. */
    ToPattern,
    /** Expr that matches a primitive value, with expr as its type string. */
    Typeof,
    /** Expr that matches a constructor instance, with expr as its constructor type. */
    InstanceOf,
    /** Expr that matches a tuple type, with each corresponding member also matched. */
    Tuple,
    /** Expr that matches a struct type, with value in each corresponding KV pairs also matched. */
    Struct,
    /** Expr that match value strictly equals itself. */
    Literal,
}

export interface PatExprForm {
    [PatExpr.Typeof]: TypeOfName;
    [PatExpr.Tuple]: unknown[];
    [PatExpr.InstanceOf]: ConstructorType;
    [PatExpr.Struct]: Record<string, unknown>;

    [PatExpr.Literal]: unknown;

    [PatExpr.ToPattern]: ToPattern<any>;
}

export interface PatExprParser<T> {
    [PatExpr.Typeof]: T extends TypeOfName ? TypeOfDict[T] : never;
    [PatExpr.Tuple]: T extends unknown[] ? ParseTuplePatExpr<T> : never;
    [PatExpr.Struct]: T extends Record<string, unknown> ? ParseStructPatExpr<T>
        : never;

    [PatExpr.InstanceOf]: T extends ConstructorType<infer R> ? R : never;
    [PatExpr.Literal]: T;
    [PatExpr.ToPattern]: T extends ToPattern<infer R> ? R : never;
}

export type PatExpressions = PatExprForm[PatExpr];

type PatExprParseSeries = [
    PatExpr.ToPattern,
    PatExpr.Typeof,
    PatExpr.InstanceOf,
    PatExpr.Tuple,
    PatExpr.Struct,
    PatExpr.Literal,
];

type MatchPatExprVariant<
    T,
    U = PatExprParseSeries,
> = U extends [
    infer S extends PatExpr,
    ...infer Rest extends PatExpr[],
] ? T extends PatExprForm[S] ? S : MatchPatExprVariant<T, Rest>
    : never;

export type ParsePatExpr<T> = PatExprParser<T>[MatchPatExprVariant<T>];

export type ParseTuplePatExpr<T extends unknown[]> = T extends
    [infer R, ...infer Rest extends unknown[]]
    ? [ParsePatExpr<R>, ...ParseTuplePatExpr<Rest>]
    : [];

export type ParseStructPatExpr<T> = {
    [K in keyof T]: ParsePatExpr<T[K]>;
};

interface PossiblePatExprDict<T = unknown> {
    [PatExpr.Typeof]: TypeOf<T> | WrappedConsOf<T>;
    [PatExpr.Tuple]: PossibleTupleExpr<T>;
    [PatExpr.Struct]: PossibleStructExpr<T>;
    [PatExpr.Literal]: T;
    [PatExpr.InstanceOf]: Extract<T, object> extends infer R extends object
        ? ConstructorType<R>
        : never | ConsOf<T>;
    [PatExpr.ToPattern]: ToPattern<T>;
    Array: T extends any[] ? Pattern<T[number][]> : never;
}

export type PossiblePatExpr<T> = PossiblePatExprDict<
    T
>[keyof PossiblePatExprDict];
type PossibleTupleExpr<T, __R = never> = T extends [...infer R, any[]]
    ? PossiblePatExpr<R>
    : __R;
type PossibleStructExpr<T> = T extends Record<string, unknown> ? {
        [K in keyof T]: PossiblePatExpr<T[K]>;
    }
    : never;
