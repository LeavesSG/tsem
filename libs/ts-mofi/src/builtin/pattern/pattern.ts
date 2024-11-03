import { CONSTRUCTOR_PROTOTYPE } from "../../types/cons.ts";
import { isWeakKey } from "../../types/map.ts";
import { type ConstructorType, isConstructorType } from "../../types/mod.ts";
import type { PhantomMarker } from "../../types/phantom.ts";
import { isTypeOf, isTypeOfNames, type TypeOfName } from "../../types/typeof.ts";
import type { TupleIntersection } from "../../utils/types.ts";
import { bound, expr } from "../builtin.ts";
import { EnumOfADT } from "../enum-struct/mod.ts";
import { Option } from "../enums/option.ts";
import { Result } from "../enums/result.ts";
import { MatchFailedReason as Reason, PatternDebug } from "./debug.ts";
import { MatchFailedError, MatchFailedError as Error } from "./error.ts";
import type { PossiblePatExpr } from "./expr.ts";
import { ParsePatExpr, PatExpr, PatExpressions, PatExprForm, PatExprParser } from "./expr.ts";
import type { ToPattern } from "./to-pattern.ts";
import { hasImplToPattern, implToPattern, SYMBOL_TO_PATTERN } from "./to-pattern.ts";

interface Debug<U = unknown> extends Pick<PatternDebug<U>, "fail" | "success" | "result"> {
    dive(prop: unknown): Debug<U>;
}

type PatternPredicate<T> = (target: unknown, debug?: Debug) => target is T;

const DISABLED_DEBUG: Debug = {
    dive: () => DISABLED_DEBUG,
    fail: () => false,
    success: () => true,
    result: Option.None(),
};

const patternCache = new WeakMap<WeakKey, Pattern>();

const debugIsTypeOf = <T extends TypeOfName>(typeName: T) => {
    return new Proxy(isTypeOf(typeName), {
        apply(target, thisArg, argArray: [unknown, Debug]) {
            const [_, debug = DISABLED_DEBUG] = argArray;
            const res = Reflect.apply(target, thisArg, argArray);
            return res && debug.success() || debug.fail(
                Reason.new("NotTypeOf", typeName),
            );
        },
    });
};

export class Pattern<T = unknown> implements ToPattern<T> {
    static DEBUG = true;

    predicate: PatternPredicate<T>;
    constructor(pred: PatternPredicate<T>) {
        this.predicate = pred;
    }

    initDebug(source: unknown) {
        if (Pattern.DEBUG) return PatternDebug.fromSource(source);
        return DISABLED_DEBUG;
    }

    exec<U>(target: U, debug: Debug = this.initDebug(target)): Result<T & U, Error> {
        const res = this.predicate(target, debug);
        if (res) return Result.Ok(target);
        const { variant, value: result } = debug.result.distribute();
        return Result.Err(expr(() => {
            switch (variant) {
                case "Some":
                    return result.value!;
                case "None":
                    return new MatchFailedError("Debug mode not enabled.");
            }
        }));
    }

    match<U>(target: U): target is T & U {
        return this.exec(target).isOk();
    }

    validator() {
        return this.match.bind(this);
    }

    notMatch<U>(target: U): target is Exclude<U, T> {
        return this.exec(target).isErr();
    }

    assert<U>(target: unknown): target is T & U {
        const res = this.exec(target);
        if (res.isOk()) return true;
        else throw res.value;
    }

    assertNot<U>(target: unknown): target is Exclude<U, T> {
        const res = this.exec(target);
        if (res.isErr()) return true;
        throw new Error();
    }

    [SYMBOL_TO_PATTERN](): Pattern<T> {
        return this;
    }

    static unknown = new this(<U>(_target: U): _target is U & unknown => true);
    static _ = this.unknown;
    static any = new this(<U>(_target: U): _target is any => true);
    static never = new this((_target: unknown, debug = DISABLED_DEBUG): _target is never =>
        debug.fail(Reason.new("NotNever", undefined))
    );

    static string = new this(debugIsTypeOf("string"));
    static number = new this(debugIsTypeOf("number"));
    static boolean = new this(debugIsTypeOf("boolean"));
    static symbol = new this(debugIsTypeOf("symbol"));
    static bigint = new this(debugIsTypeOf("bigint"));
    static object = new this(debugIsTypeOf("object"));
    static function = new this(debugIsTypeOf("function"));
    static undefined = this.equal(undefined);
    static null = this.equal(null);
    static NaN = new this((target, debug = DISABLED_DEBUG): target is number =>
        Number.isNaN(target) || debug.fail(Reason.new("NotEqualTo", NaN))
    );

    static array = this.arrOf(this._);

    static typeOf<const T extends PatExprForm[PatExpr.Typeof]>(expr: T) {
        return this[expr];
    }

    static equal<const T>(expr: T) {
        if (Number.isNaN(expr)) return this.NaN as Pattern<T>;
        return new this(<U>(target: U, debug = DISABLED_DEBUG): target is U & T =>
            (target as never) === expr && debug.success() || debug.fail(Reason.new("NotEqualTo", expr))
        );
    }

    static tuple<const T extends PatExprForm[PatExpr.Tuple]>(expr: T) {
        return new this(
            <U>(target: U, debug: Debug<U> = DISABLED_DEBUG): target is U & PatExprParser<T>[PatExpr.Tuple] => {
                if (!Array.isArray(target)) return debug.fail(Reason.new("NotInstanceOf", Array));
                return Array.isArray(target) && expr.every((child, index) => {
                    const dived = debug.dive(index as keyof U);
                    const res = Pattern.from(child).exec(target[index], dived);
                    return res.isOk() && debug.success() || debug.fail(
                        Reason.new("NotMatchAtIndex", index),
                        res.value,
                    );
                });
            },
        );
    }

    static struct<const T extends PatExprForm[PatExpr.Struct]>(expr: T) {
        return new this(
            <U>(target: U, debug: Debug<U> = DISABLED_DEBUG): target is U & PatExprParser<T>[PatExpr.Struct] => {
                if (!target || typeof target !== "object") return debug.fail(Reason.new("NotTypeOf", "object"));
                return Object.entries(expr).every(([key, value]) => {
                    if (!(key in target)) return debug.fail(Reason.new("MissingProp", void 0));
                    const dived = debug.dive(key as keyof U);
                    const res = Pattern.from(value).exec(target[key as keyof U], dived);
                    return res.isOk() && debug.success() || debug.fail(
                        Reason.new("NotMatchAtProp", key),
                        res.value as Error,
                    );
                });
            },
        );
    }

    static instOf<const T extends PatExprForm[PatExpr.InstanceOf]>(expr: T) {
        return new this(
            <U>(target: U, debug: Debug<U> = DISABLED_DEBUG): target is PatExprParser<T>[PatExpr.InstanceOf] => {
                if (target instanceof expr) return debug.success();
                return debug.fail(Reason.new("NotInstanceOf", expr));
            },
        );
    }

    static ctorOf<const T>(expr: T) {
        return new this(<U>(target: U, debug: Debug = DISABLED_DEBUG): target is U & ConstructorType<T> => {
            if (!isConstructorType(target)) return debug.fail(Reason.new("NotConstructorOf", CONSTRUCTOR_PROTOTYPE));
            if (expr instanceof target) return debug.success();
            return debug.fail(Reason.new("NotConstructorOf", expr));
        });
    }

    static union<const T extends PatExpressions[]>(expr: T) {
        return new this(<U>(target: U, debug: Debug = DISABLED_DEBUG): target is U & ParsePatExpr<T[number]> => {
            return expr.some(expr => {
                const pattern = this.from(expr);
                return pattern.exec(target).isOk();
            }) || debug.fail(Reason.new("NotMatchAnyOfUnion", undefined));
        });
    }
    static intersect<const T extends PatExpressions[]>(expr: T) {
        return new this(<U>(
            target: U,
            debug: Debug = DISABLED_DEBUG,
        ): target is U & ParsePatExpr<TupleIntersection<T>> =>
            expr.every((exp, index) => {
                const dived = debug.dive(index);
                const res = this.from(exp).exec(target, dived);
                return res.isOk() && debug.success()
                    || debug.fail(Reason.new("NotMatchIntersection", index), res.value as Error);
            })
        );
    }

    static arrOf<const T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        return new this((target: unknown, debug = DISABLED_DEBUG): target is ParsePatExpr<T>[] => {
            if (!(Array.isArray(target))) return debug.fail(Reason.new("NotInstanceOf", Array));
            const pattern = this.from(expr);
            return target.every((child, index) => {
                const res = pattern.exec(child);
                return res.isOk() && debug.success() || debug.fail(Reason.new("NotMatchAtIndex", index));
            });
        });
    }

    static enumOf<
        const T extends typeof EnumOfADT<any, any>,
        Var extends keyof InstanceType<T>[PhantomMarker] = keyof InstanceType<T>[PhantomMarker],
        Val extends InstanceType<T>[PhantomMarker][Var] = InstanceType<T>[PhantomMarker][Var],
    >(
        enumStruct: T,
        variant: Var | Pattern<Var> = _ as Pattern<Var>,
        value: PossiblePatExpr<Val> = _ as Pattern<Val>,
    ): Pattern<InstanceType<T> & { variant: Var; value: Val }> {
        return new this(<U>(target: U, debug = DISABLED_DEBUG): target is U & InstanceType<T> => {
            if (!(target instanceof enumStruct)) return debug.fail(Reason.new("NotInstanceOf", enumStruct));
            const varRes: Result<unknown, Error> = this.from(variant).exec(target.variant);
            if (varRes.isErr()) {
                return debug.fail(
                    Reason.new("NotMatchEnumVariant", variant as string),
                    varRes.value,
                );
            }
            const valRes = this.from(value).exec(target.value);
            if (valRes.isErr()) {
                debug.fail(
                    Reason.new("NotMatchEnumValue", value),
                    valRes.value,
                );
            }
            return varRes.isOk() && valRes.isOk();
        });
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
            || this.equal(expr);
    }
}

export const Pat = Pattern;
export const { any, never, _, string, number, array, bigint, boolean, function: func } = Pattern;

export const { arrOf, ctorOf, instOf, enumOf, equal, union, intersect, tuple, struct, typeOf, from: pattern } = bound(
    Pattern,
);

implToPattern(String, {
    toPattern(): Pattern<unknown> {
        if (isTypeOfNames(this)) {
            return Pat[this];
        }
        return Pat.equal(this);
    },
});

implToPattern(Array, {
    toPattern(): Pattern<unknown> {
        return Pat.tuple(this);
    },
});

implToPattern(Function, {
    toPattern(): Pattern<unknown> {
        if (isConstructorType(this)) {
            return Pattern.instOf(this);
        } else {
            return Pattern.equal(this);
        }
    },
});

implToPattern(Object, {
    toPattern(): Pattern<unknown> {
        return Pattern.struct(this as Record<string, unknown>);
    },
});

implToPattern(EnumOfADT, {
    toPattern(): Pattern<typeof this> {
        return new Pattern(<U>(target: U): target is U & EnumOfADT<any, any> => {
            const ctor = this.constructor as typeof EnumOfADT;
            if (!(target instanceof ctor)) return false;
            return target.isVariant(this.variant);
        });
    },
});
