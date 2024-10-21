import { isWeakKey } from "../../types/map.ts";
import { type ConstructorType, isConstructorType } from "../../types/mod.ts";
import type { PhantomMarker } from "../../types/phantom.ts";
import { isTypeOf, isTypeOfNames } from "../../types/typeof.ts";
import type { TupleIntersection } from "../../utils/types.ts";
import { EnumStruct } from "../enum-struct/mod.ts";
import type { PossiblePatExpr } from "./expr.ts";
import { ParsePatExpr, PatExpr, PatExpressions, PatExprForm, PatExprParser } from "./expr.ts";
import type { ToPattern } from "./to-pattern.ts";
import { hasImplToPattern, implToPattern, SYMBOL_TO_PATTERN } from "./to-pattern.ts";

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

    notMatch<U>(target: U): target is Exclude<U, T> {
        return !this.predicate(target);
    }

    [SYMBOL_TO_PATTERN](): Pattern<T> {
        return this;
    }

    static unknown = new this((_target: unknown): _target is unknown => true);
    static _ = this.unknown;
    static any = new this((_target: unknown): _target is any => true);
    static never = new this((_target: unknown): _target is never => false);

    static string = new this(isTypeOf("string"));
    static number = new this(isTypeOf("number"));
    static boolean = new this(isTypeOf("boolean"));
    static symbol = new this(isTypeOf("symbol"));
    static bigint = new this(isTypeOf("bigint"));
    static object = new this(isTypeOf("object"));
    static function = new this(isTypeOf("function"));
    static undefined = this.literal(undefined);
    static null = this.literal(null);
    static NaN = new this((target: unknown): target is number => Number.isNaN(target));

    static array = this.arrOf(this._);

    static typeOf<const T extends PatExprForm[PatExpr.Typeof]>(expr: T) {
        return this[expr];
    }

    static tuple<const T extends PatExprForm[PatExpr.Tuple]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Tuple] =>
            Array.isArray(target) && expr.every((child, index) => Pattern.from(child).match(target[index]));
        return new this(pred);
    }

    static struct<const T extends PatExprForm[PatExpr.Struct]>(expr: T) {
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

    static instOf<const T extends PatExprForm[PatExpr.InstanceOf]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.InstanceOf] => {
            return target instanceof expr;
        };
        return new this(pred);
    }

    static ctorOf<const T>(expr: T) {
        const pred = (target: unknown): target is ConstructorType<T> => {
            return isConstructorType(target) && expr instanceof target;
        };
        return new this(pred);
    }

    static literal<const T>(expr: T) {
        if (Number.isNaN(expr)) return this.NaN;
        return new this((target: unknown): target is T => target === expr);
    }

    static union<const T extends PatExpressions[]>(expr: T) {
        const pred = (target: unknown): target is ParsePatExpr<T[number]> => {
            return expr.some(expr => {
                const pattern = this.from(expr);
                return pattern.match(target);
            });
        };
        return new this(pred);
    }
    static intersect<const T extends PatExpressions[]>(expr: T) {
        const pred = (target: unknown): target is ParsePatExpr<TupleIntersection<T>> => {
            return expr.every(expr => {
                const pattern = this.from(expr);
                return pattern.match(target);
            });
        };
        return new this(pred);
    }

    static arrOf<const T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        const pred = (target: unknown): target is ParsePatExpr<T>[] => {
            if (!(Array.isArray(target))) return false;
            const pattern = this.from(expr);
            return target.every(child => {
                return pattern.match(child);
            });
        };
        return new this(pred);
    }
    static enumOf<
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

    static from<T extends PatExprForm[PatExpr.ToPattern]>(expr: T): Pattern<PatExprParser<T>[PatExpr.ToPattern]>;
    static from<const T extends PatExprForm[PatExpr.Typeof]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Typeof]>;
    static from<T extends PatExprForm[PatExpr.InstanceOf]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.InstanceOf]>;
    static from<T extends PatExprForm[PatExpr.Tuple]>(expr: [...T]): Pattern<PatExprParser<T>[PatExpr.Tuple]>;
    static from<T extends PatExprForm[PatExpr.Struct]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Struct]>;
    static from<const T extends PatExprForm[PatExpr.Literal]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Literal]>;
    static from<T>(expr: T) {
        return (isWeakKey(expr) && this.checkCache(expr))
            || (hasImplToPattern(expr) && expr[SYMBOL_TO_PATTERN]())
            || this.literal(expr);
    }
}

export const Pat = Pattern;
export const { any, never, _, string, number, array, bigint, boolean, function: func } = Pattern;

export const { arrOf, ctorOf, instOf, enumOf, literal, union, intersect, tuple, struct, typeOf, from: pattern } =
    new Proxy(Pat, {
        get(target, prop, rec) {
            const res = Reflect.get(target, prop, rec);
            return func.match(res) && Pattern.instOf(Pattern).notMatch(res) && res.bind(Pattern) || res;
        },
    });

implToPattern(String, {
    toPattern(): Pattern<unknown> {
        if (isTypeOfNames(this)) {
            return Pat[this];
        }
        return Pat.literal(this);
    },
});

implToPattern(Array, {
    toPattern(): Pattern<unknown[]> {
        return Pat.tuple(this);
    },
});

implToPattern(Function, {
    toPattern(): Pattern<unknown> {
        if (isConstructorType(this)) {
            return Pattern.instOf(this);
        } else {
            return Pattern.literal(this);
        }
    },
});

implToPattern(Object, {
    toPattern(): Pattern<unknown> {
        return Pattern.struct(this as Record<string, unknown>);
    },
});
