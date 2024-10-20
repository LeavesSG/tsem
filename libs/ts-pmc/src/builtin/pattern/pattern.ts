import { isWeakKey } from "../../types/map.ts";
import { type ConstructorType, isConstructorType, isPrimitiveTypeName } from "../../types/mod.ts";
import type { PhantomMarker } from "../../types/phantom.ts";
import { PRIMITIVE_TYPE_DICT } from "../../types/primitive.ts";
import { EnumStruct } from "../enum-struct/mod.ts";
import type { PossiblePatExpr } from "./expr.ts";
import { ParsePatExpr, PatExpr, PatExpressions, PatExprForm, PatExprParser } from "./expr.ts";
import type { ToPattern } from "./to-pattern.ts";
import { implToPattern, SYMBOL_TO_PATTERN } from "./to-pattern.ts";

type PatternPredicate<T> = (target: unknown) => target is T;

const patternCache = new WeakMap<WeakKey, Pattern>();

export class Pattern<T = unknown> implements ToPattern<T> {
    predicate: PatternPredicate<T>;
    constructor(pred: PatternPredicate<T>) {
        this.predicate = pred;
    }
    match(target: unknown): target is T {
        return this.predicate(target);
    }

    [SYMBOL_TO_PATTERN](): Pattern<T> {
        return this;
    }

    static typeof<T extends PatExprForm[PatExpr.Typeof]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Typeof] => {
            const typeName = typeof target;
            return typeName === expr;
        };
        return new this(pred);
    }

    static tuple<T extends PatExprForm[PatExpr.Tuple]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Tuple] =>
            Array.isArray(target) && expr.every((child, index) => Pattern.from(child).match(target[index]));
        return new this(pred);
    }

    static struct<T extends PatExprForm[PatExpr.Struct]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Struct] => {
            if (!target || typeof target !== "object") return false;
            return Object.entries(expr).every(([key, value]) => {
                if (!(key in target)) return false;
                const corVal = (target as Record<string, unknown>)[key];
                return Pattern.from(value).match(corVal);
            });
        };
        return new this(pred);
    }

    static instOf<T extends PatExprForm[PatExpr.InstanceOf]>(expr: T) {
        for (const [key, value] of Object.entries(PRIMITIVE_TYPE_DICT)) {
            if (value as unknown !== expr) continue;
            const pred = (target: unknown): target is PatExprParser<T>[PatExpr.InstanceOf] => {
                const targetType = typeof target;
                return target instanceof expr || targetType === key;
            };
            return new this(pred);
        }
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.InstanceOf] => {
            return target instanceof expr;
        };
        return new this(pred);
    }

    static ctorOf<T>(expr: T) {
        const pred = (target: unknown): target is ConstructorType<T> => {
            return isConstructorType(target) && expr instanceof target;
        };
        return new this(pred);
    }

    static literal<const T>(expr: T) {
        const pred = (target: unknown): target is T => {
            return target === expr;
        };
        return new this(pred);
    }
    static union<T extends PatExpressions[]>(expr: T) {
        const pred = (target: unknown): target is ParsePatExpr<T[number]> => {
            return expr.some(expr => {
                const pattern = this.from(expr);
                return pattern.match(target);
            });
        };
        return new this(pred);
    }

    static arrOf<T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        const pred = (target: unknown): target is ParsePatExpr<T>[] => {
            if (!(Array.isArray(target))) return false;
            const pattern = this.from(expr);
            return target.every(child => {
                return pattern.match(child);
            });
        };
        return new this(pred);
    }
    static enum<
        const T extends typeof EnumStruct<any, any>,
        Var extends keyof InstanceType<T>[PhantomMarker] = keyof InstanceType<T>[PhantomMarker],
        Val extends InstanceType<T>[PhantomMarker][Var] = InstanceType<T>[PhantomMarker][Var],
    >(
        enumStruct: T,
        variant: Var | Pattern<Var> = _ as Pattern<Var>,
        value: PossiblePatExpr<Val> = _ as Pattern<Val>,
    ): Pattern<InstanceType<T> & { variant: Var; value: Val }> {
        const pred = (target: unknown): target is InstanceType<T> => {
            if (!(target instanceof enumStruct)) {
                return false;
            }
            return this.from(variant).match(target.variant) && this.from(value).match(target.value);
        };
        return new this(pred);
    }

    static checkCache(expr: WeakKey) {
        const cache = patternCache.get(expr);
        if (cache) return cache;
    }

    static from<const T extends PatExprForm[PatExpr.ToPattern]>(expr: T): Pattern<PatExprParser<T>[PatExpr.ToPattern]>;
    static from<const T extends PatExprForm[PatExpr.Typeof]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Typeof]>;
    static from<const T extends PatExprForm[PatExpr.InstanceOf]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.InstanceOf]>;
    static from<const T extends PatExprForm[PatExpr.Tuple]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Tuple]>;
    static from<const T extends PatExprForm[PatExpr.Struct]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Struct]>;
    static from<const T extends PatExprForm[PatExpr.Literal]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Literal]>;
    static from<const T>(expr: T) {
        return (isWeakKey(expr) && this.checkCache(expr))
            || (implToPattern(expr) && expr[SYMBOL_TO_PATTERN]())
            || (isPrimitiveTypeName(expr) && this.typeof(expr))
            || (Array.isArray(expr) && this.tuple(expr))
            || (isConstructorType(expr) && this.instOf(expr))
            || (typeof expr === "object" && this.struct(expr as Record<string, unknown>))
            || this.literal(expr);
    }

    static unknown = new this((_target: unknown): _target is unknown => {
        return true;
    });
    static _ = this.unknown;
    static string = this.typeof("string");
    static number = this.typeof("number");
    static array = this.arrOf(this._);
}

export const Pat = Pattern;
export const pattern = Pat.from.bind(Pat);
export const { _, string, number, array } = Pat;
