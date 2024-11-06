import { EnumOfADT } from "../adt/mod.ts";
import { Option, Result } from "../enums/mod.ts";
import { type FunctionType, hasImplToPattern } from "../mod.ts";
import type { SYMBOL_PHANTOM } from "../shared/mod.ts";
import { bound, expr } from "../utils/mod.ts";
import type { TupleIntersection } from "../utils/union-type.ts";
import {
    CONSTRUCTOR_PROTOTYPE,
    type ConstructorType,
    isConstructorType,
    isTypeOf,
    isTypeOfNames,
    isWeakKey,
    type TypeOfDict,
    type TypeOfName,
} from "../vanilla/mod.ts";
import { MatchFailedReason as Reason, PatternDebug } from "./debug.ts";
import { MatchFailedError as Error } from "./error.ts";
import type {
    ParsePatExpr,
    ParseStructPatExpr,
    ParseTuplePatExpr,
    PatExpr,
    PatExpressions,
    PatExprForm,
    PatExprParser,
    PossiblePatExpr,
} from "./expr.ts";
import {
    implToPattern,
    SYMBOL_TO_PATTERN,
    type ToPattern,
} from "./to-pattern.ts";

interface Debug<U = unknown>
    extends Pick<PatternDebug<U>, "fail" | "success" | "result"> {
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

const debugIsTypeOf: <T extends TypeOfName>(
    typeName: T,
) => <U>(target: U) => target is U & TypeOfDict[T] = <T extends TypeOfName>(
    typeName: T,
) => {
    return new Proxy(isTypeOf(typeName), {
        apply(target, thisArg, argArray: [unknown, Debug]) {
            const [_, debug = DISABLED_DEBUG] = argArray;
            const res = Reflect.apply(target, thisArg, argArray);
            return res && debug.success() || debug.fail(
                new Reason("NotTypeOf", typeName),
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

    initDebug(source: unknown): Debug<unknown> {
        if (Pattern.DEBUG) return PatternDebug.fromSource(source);
        return DISABLED_DEBUG;
    }

    exec<U>(
        target: U,
        debug: Debug = this.initDebug(target),
    ): Result<T & U, Error> {
        const res = this.predicate(target, debug);
        if (res) return Result.Ok(target);
        const { variant, value: result } = debug.result.asADT();
        return Result.Err(expr(() => {
            switch (variant) {
                case "Some":
                    return result.value!;
                case "None":
                    return new Error("Debug mode not enabled.");
            }
        }));
    }

    match<U>(target: U): target is T & U {
        return this.exec(target).isOk();
    }

    validator(): <U>(target: U) => target is T & U {
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

    static unknown: Pattern<unknown> = new this(<U>(
        _target: U,
    ): _target is U & unknown => true);
    static _: Pattern<unknown> = this.unknown;
    static any: Pattern<any> = new this(<U>(_target: U): _target is any =>
        true
    );
    static never: Pattern<never> = new this((
        _target: unknown,
        debug = DISABLED_DEBUG,
    ): _target is never => debug.fail(new Reason("NotNever", undefined)));

    static string: Pattern<string> = new this(debugIsTypeOf("string"));
    static number: Pattern<number> = new this(debugIsTypeOf("number"));
    static boolean: Pattern<boolean> = new this(debugIsTypeOf("boolean"));
    static symbol: Pattern<symbol> = new this(debugIsTypeOf("symbol"));
    static bigint: Pattern<bigint> = new this(debugIsTypeOf("bigint"));
    static object: Pattern<object> = new this(debugIsTypeOf("object"));
    static function: Pattern<FunctionType> = new this(
        debugIsTypeOf("function"),
    );
    static undefined: Pattern<void> = this.equalTo(undefined);
    static null: Pattern<null> = this.equalTo(null);
    static NaN: Pattern<number> = new this((
        target,
        debug = DISABLED_DEBUG,
    ): target is number =>
        Number.isNaN(target) || debug.fail(new Reason("NotEqualTo", NaN))
    );

    static array: Pattern<unknown[]> = this.arrOf(this._);

    static typeOf<const T extends PatExprForm[PatExpr.Typeof]>(
        expr: T,
    ): (typeof Pattern)[T] {
        return this[expr];
    }

    static equalTo<const T>(expr: T): Pattern<T> {
        if (Number.isNaN(expr)) return this.NaN as Pattern<T>;
        return new this(<U>(
            target: U,
            debug = DISABLED_DEBUG,
        ): target is U & T =>
            (target as never) === expr && debug.success() ||
            debug.fail(new Reason("NotEqualTo", expr))
        );
    }

    static fromTuple<const T extends PatExprForm[PatExpr.Tuple]>(
        expr: T,
    ): Pattern<T extends unknown[] ? ParseTuplePatExpr<T> : never> {
        return new this(
            <U>(
                target: U,
                debug: Debug<U> = DISABLED_DEBUG,
            ): target is U & PatExprParser<T>[PatExpr.Tuple] => {
                if (!Array.isArray(target)) {
                    return debug.fail(new Reason("NotInstanceOf", Array));
                }
                return Array.isArray(target) && expr.every((child, index) => {
                    const dived = debug.dive(index as keyof U);
                    const res = Pattern.from(child).exec(target[index], dived);
                    return res.isOk() && debug.success() || debug.fail(
                        new Reason("NotMatchAtIndex", index),
                        res.value,
                    );
                });
            },
        );
    }

    static fromObj<const T extends PatExprForm[PatExpr.Struct]>(
        expr: T,
    ): Pattern<
        T extends Record<string, unknown> ? ParseStructPatExpr<T> : never
    > {
        return new this(
            <U>(
                target: U,
                debug: Debug<U> = DISABLED_DEBUG,
            ): target is U & PatExprParser<T>[PatExpr.Struct] => {
                if (!target || typeof target !== "object") {
                    return debug.fail(new Reason("NotTypeOf", "object"));
                }
                return Object.entries(expr).every(([key, value]) => {
                    if (!(key in target)) {
                        return debug.fail(new Reason("MissingProp", void 0));
                    }
                    const dived = debug.dive(key as keyof U);
                    const res = Pattern.from(value).exec(
                        target[key as keyof U],
                        dived,
                    );
                    return res.isOk() && debug.success() || debug.fail(
                        new Reason("NotMatchAtProp", key),
                        res.value as Error,
                    );
                });
            },
        );
    }

    static instOf<const T extends PatExprForm[PatExpr.InstanceOf]>(
        expr: T,
    ): Pattern<T extends ConstructorType<infer R> ? R : never> {
        return new this(
            <U>(
                target: U,
                debug: Debug<U> = DISABLED_DEBUG,
            ): target is PatExprParser<T>[PatExpr.InstanceOf] => {
                if (target instanceof expr) return debug.success();
                return debug.fail(new Reason("NotInstanceOf", expr));
            },
        );
    }

    static ctorOf<const T>(expr: T): Pattern<ConstructorType<T>> {
        return new this(
            <U>(
                target: U,
                debug: Debug = DISABLED_DEBUG,
            ): target is U & ConstructorType<T> => {
                if (!isConstructorType(target)) {
                    return debug.fail(
                        new Reason("NotConstructorOf", CONSTRUCTOR_PROTOTYPE),
                    );
                }
                if (expr instanceof target) return debug.success();
                return debug.fail(new Reason("NotConstructorOf", expr));
            },
        );
    }

    static unionOf<const T extends PatExpressions[]>(
        expr: T,
    ): Pattern<ParsePatExpr<T[number]>> {
        return new this(
            <U>(
                target: U,
                debug: Debug = DISABLED_DEBUG,
            ): target is U & ParsePatExpr<T[number]> => {
                return expr.some((expr) => {
                    const pattern = this.from(expr);
                    return pattern.exec(target).isOk();
                }) || debug.fail(new Reason("NotMatchAnyOfUnion", undefined));
            },
        );
    }
    static intxnOf<const T extends PatExpressions[]>(
        expr: T,
    ): Pattern<ParsePatExpr<TupleIntersection<T>>> {
        return new this(<U>(
            target: U,
            debug: Debug = DISABLED_DEBUG,
        ): target is U & ParsePatExpr<TupleIntersection<T>> =>
            expr.every((exp, index) => {
                const dived = debug.dive(index);
                const res = this.from(exp).exec(target, dived);
                return res.isOk() && debug.success() ||
                    debug.fail(
                        new Reason("NotMatchIntersection", index),
                        res.value as Error,
                    );
            })
        );
    }

    static arrOf<const T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        return new this(
            (
                target: unknown,
                debug = DISABLED_DEBUG,
            ): target is ParsePatExpr<T>[] => {
                if (!(Array.isArray(target))) {
                    return debug.fail(
                        new Reason("NotInstanceOf", Array),
                    );
                }
                const pattern = this.from(expr);
                return target.every((child, index) => {
                    const res = pattern.exec(child);
                    return res.isOk() && debug.success() ||
                        debug.fail(new Reason("NotMatchAtIndex", index));
                });
            },
        );
    }

    static enumOf<
        const T extends typeof EnumOfADT<any, any>,
        Var extends keyof InstanceType<T>[typeof SYMBOL_PHANTOM] =
            keyof InstanceType<T>[typeof SYMBOL_PHANTOM],
        Val extends InstanceType<T>[typeof SYMBOL_PHANTOM][Var] = InstanceType<
            T
        >[typeof SYMBOL_PHANTOM][Var],
    >(
        enumCtor: T,
        variant: Var | Pattern<Var> = _ as Pattern<Var>,
        value: PossiblePatExpr<Val> = _ as Pattern<Val>,
    ): Pattern<InstanceType<T> & { variant: Var; value: Val }> {
        return new this(
            <U>(
                target: U,
                debug = DISABLED_DEBUG,
            ): target is U & InstanceType<T> => {
                if (!(target instanceof enumCtor)) {
                    return debug.fail(new Reason("NotInstanceOf", enumCtor));
                }
                const varRes: Result<unknown, Error> = this.from(variant).exec(
                    target.variant,
                );
                if (varRes.isErr()) {
                    return debug.fail(
                        new Reason("NotMatchEnumVariant", variant as string),
                        varRes.value,
                    );
                }
                const valRes = this.from(value).exec(target.value);
                if (valRes.isErr()) {
                    debug.fail(
                        new Reason("NotMatchEnumValue", value),
                        valRes.value,
                    );
                }
                return varRes.isOk() && valRes.isOk();
            },
        );
    }

    static checkCache(expr: WeakKey): Pattern<unknown> | undefined {
        const cache = patternCache.get(expr);
        if (cache) return cache;
    }

    static from<T extends PatExprForm[PatExpr.ToPattern]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.ToPattern]>;
    static from<const T extends PatExprForm[PatExpr.Typeof]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.Typeof]>;
    static from<T extends PatExprForm[PatExpr.InstanceOf]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.InstanceOf]>;
    static from<T extends PatExprForm[PatExpr.Tuple]>(
        expr: [...T],
    ): Pattern<PatExprParser<T>[PatExpr.Tuple]>;
    static from<T extends PatExprForm[PatExpr.Struct]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.Struct]>;
    static from<const T extends PatExprForm[PatExpr.Literal]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.Literal]>;
    static from<T>(expr: T) {
        return (isWeakKey(expr) && this.checkCache(expr)) ||
            (hasImplToPattern(expr) && expr[SYMBOL_TO_PATTERN]()) ||
            this.equalTo(expr);
    }
}

export const Pat = Pattern;
export const any = Pattern.any;
export const never = Pattern.never;
export const _ = Pattern._;
export const string = Pattern.string;
export const number = Pattern.number;
export const array = Pattern.array;
export const bigint = Pattern.bigint;
export const boolean = Pattern.boolean;
export const func = Pattern.function;

const boundPattern: typeof Pattern = bound(Pattern);
export const typeOf = boundPattern.typeOf;
export const arrOf = boundPattern.arrOf;
export const instOf = boundPattern.instOf;
export const ctorOf = boundPattern.ctorOf;
export const enumOf = boundPattern.enumOf;
export const equalTo = boundPattern.equalTo;
export const unionOf = boundPattern.unionOf;
export const intxnOf = boundPattern.intxnOf;
export const fromTuple = boundPattern.fromTuple;
export const fromObj = boundPattern.fromObj;
export const from = boundPattern.from;

implToPattern(String, {
    toPattern(): Pattern<unknown> {
        if (isTypeOfNames(this)) {
            return Pat[this];
        }
        return Pat.equalTo(this);
    },
});

implToPattern(Array, {
    toPattern(): Pattern<unknown> {
        return Pat.fromTuple(this);
    },
});

implToPattern(Function, {
    toPattern(): Pattern<unknown> {
        if (isConstructorType(this)) {
            return Pattern.instOf(this);
        } else {
            return Pattern.equalTo(this);
        }
    },
});

implToPattern(Object, {
    toPattern(): Pattern<unknown> {
        return Pattern.fromObj(this as Record<string, unknown>);
    },
});

implToPattern(EnumOfADT, {
    toPattern(): Pattern<EnumOfADT> {
        return new Pattern(
            <U>(target: U): target is U & EnumOfADT<any, any> => {
                const ctor = this.constructor as typeof EnumOfADT;
                if (!(target instanceof ctor)) return false;
                return target.isVariant(this.variant);
            },
        );
    },
});
