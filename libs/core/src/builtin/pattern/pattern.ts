import { isWeakKey } from "../../types/map.ts";
import { type ConstructorType, isConstructorType } from "../../types/mod.ts";
import type { PhantomMarker } from "../../types/phantom.ts";
import { isTypeOf, isTypeOfNames, type TypeOfName } from "../../types/typeof.ts";
import type { TupleIntersection } from "../../utils/types.ts";
import { EnumStruct } from "../enum-struct/mod.ts";
import { Result } from "../enums/result.ts";
import { MatchFailedError } from "./error.ts";
import type { PossiblePatExpr } from "./expr.ts";
import { ParsePatExpr, PatExpr, PatExpressions, PatExprForm, PatExprParser } from "./expr.ts";
import type { ToPattern } from "./to-pattern.ts";
import { hasImplToPattern, implToPattern, SYMBOL_TO_PATTERN } from "./to-pattern.ts";

type PatternPredicate<T, U = unknown> = (target: U) => target is T & U;

const patternCache = new WeakMap<WeakKey, Pattern>();

export const debugIsTypeOf = <T extends TypeOfName>(typeName: T) => {
    return new Proxy(isTypeOf(typeName), {
        apply(target, thisArg, argArray) {
            const res = Reflect.apply(target, thisArg, argArray);
            return res && Pattern.success() || Pattern.failedOfNotTypeOf(typeName);
        },
    });
};

export class Pattern<T = unknown> implements ToPattern<T> {
    static DEBUG = true;

    predicate: PatternPredicate<T>;
    constructor(pred: PatternPredicate<T>) {
        this.predicate = pred.bind(this);
    }

    exec<U>(target: U): Result<T & U, MatchFailedError> {
        try {
            const res = this.predicate(target);
            if (res) return Result.Ok(target);
            let msg = "Target didn't pass the predicate function.";
            if (!Pattern.DEBUG) msg += "Please enable `Pattern.DEBUG` for further debug information.";
            throw MatchFailedError.new(msg);
        } catch (err: any) {
            return Result.Err(err);
        }
    }

    match<U>(target: U): target is T & U {
        return this.exec(target).isOk();
    }

    notMatch<U>(target: U): target is Exclude<U, T> {
        return this.exec(target).isErr();
    }

    assert<U>(target: unknown): target is T & U {
        const res = this.exec(target);
        if (res.isOk()) return Pattern.success();
        else throw res.value;
    }

    assertNot<U>(target: unknown): target is Exclude<U, T> {
        const res = this.exec(target);
        if (res.isErr()) return true;
        throw new MatchFailedError();
    }

    [SYMBOL_TO_PATTERN](): Pattern<T> {
        return this;
    }

    static success(): true {
        return true;
    }
    static failed(err?: MatchFailedError): false {
        throw err;
    }
    static failedOfNotInstOf(expr: ConstructorType) {
        return this.failed(
            MatchFailedError.new(`Target should be instance of <[${expr.name}]>.`),
        );
    }
    static failedOfNotArray() {
        return this.failedOfNotInstOf(Array);
    }
    static failedOfNotEq(expr: unknown) {
        return this.failed(
            MatchFailedError.new(`Target should be equal to \`${expr}\`.`),
        );
    }
    static failedOfNotTypeOf(expr: unknown) {
        return this.failed(
            MatchFailedError.new(`Target should be type of <${expr}>.`),
        );
    }

    static unknown = new this((_target: unknown): _target is unknown => this.success());
    static _ = this.unknown;
    static any = new this((_target: unknown): _target is any => this.success());
    static never = new this((_target: unknown): _target is never => this.failedOfNotTypeOf("never"));

    static string = new this(debugIsTypeOf("string"));
    static number = new this(debugIsTypeOf("number"));
    static boolean = new this(debugIsTypeOf("boolean"));
    static symbol = new this(debugIsTypeOf("symbol"));
    static bigint = new this(debugIsTypeOf("bigint"));
    static object = new this(debugIsTypeOf("object"));
    static function = new this(debugIsTypeOf("function"));
    static undefined = this.literal(undefined);
    static null = this.literal(null);
    static NaN = new this((target: unknown): target is number => Number.isNaN(target));

    static array = this.arrOf(this._);

    static typeOf<const T extends PatExprForm[PatExpr.Typeof]>(expr: T) {
        return this[expr];
    }

    static tuple<const T extends PatExprForm[PatExpr.Tuple]>(expr: T) {
        const pred = <U>(target: U): target is U & PatExprParser<T>[PatExpr.Tuple] => {
            if (!Array.isArray(target)) return this.failedOfNotArray();
            return Array.isArray(target) && expr.every((child, index) => {
                const res = Pattern.from(child).exec(target[index]);
                return res.isOk() && this.success() || this.failed(
                    MatchFailedError.new(`Target <array> not matching at index ["${index}"].`, {
                        cause: res.value,
                    }),
                );
            });
        };
        return new this(pred);
    }

    static struct<const T extends PatExprForm[PatExpr.Struct]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Struct] => {
            if (!target || typeof target !== "object") {
                return this.failedOfNotTypeOf(Object.name);
            }
            return Object.entries(expr).every(([key, value]) => {
                if (!(key in target)) {
                    return this.failed(
                        MatchFailedError.new(`Target <object> is missing required propKey ["${key}"].`),
                    );
                }
                const res = Pattern.from(value).exec((target as Record<string, unknown>)[key]);
                return res.isOk() && this.success() || this.failed(
                    MatchFailedError.new(`Target <object> is incompatible on propKey ["${key}"].`, {
                        cause: res.value,
                    }),
                );
            });
        };
        return new this(pred);
    }

    static instOf<const T extends PatExprForm[PatExpr.InstanceOf]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.InstanceOf] => {
            if (target instanceof expr) return this.success();
            return this.failedOfNotInstOf(expr);
        };
        return new this(pred);
    }

    static ctorOf<const T>(expr: T) {
        const pred = (target: unknown): target is ConstructorType<T> => {
            if (!isConstructorType(target)) return this.failedOfNotTypeOf("constructor type");
            if (expr instanceof target) return this.success();
            return this.failed(
                MatchFailedError.new(`Target should be constructor type of \`${expr}\`.`),
            );
        };
        return new this(pred);
    }

    static literal<const T>(expr: T) {
        if (Number.isNaN(expr)) return this.NaN as Pattern<T>;
        return new this((target: unknown): target is T =>
            target === expr && this.success() || this.failedOfNotEq(expr)
        );
    }

    static union<const T extends PatExpressions[]>(expr: T) {
        const pred = (target: unknown): target is ParsePatExpr<T[number]> => {
            return expr.some(expr => {
                const pattern = this.from(expr);
                return pattern.exec(target).isOk();
            }) || this.failed(
                MatchFailedError.new(`Target is not compatible to any of union \`${expr}\`.`),
            );
        };
        return new this(pred);
    }
    static intersect<const T extends PatExpressions[]>(expr: T) {
        const pred = (target: unknown): target is ParsePatExpr<TupleIntersection<T>> => {
            return expr.every((exp, index) => {
                const res = this.from(exp).exec(target);
                return res.isOk() && this.success()
                    || this.failed(
                        MatchFailedError.new(
                            `Target is not compatible to intersection type \`${expr}\` at index ["${index}"].`,
                            { cause: res.value },
                        ),
                    );
            });
        };
        return new this(pred);
    }

    static arrOf<const T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        const pred = (target: unknown): target is ParsePatExpr<T>[] => {
            if (!(Array.isArray(target))) return this.failedOfNotArray();
            const pattern = this.from(expr);
            return target.every((child, index) => {
                const res = pattern.exec(child);
                return res.isOk() && this.success() || this.failed(
                    MatchFailedError.new(
                        `Target <array> has incompatible child with array of type \`${expr}\` at index ["${index}"].`,
                        { cause: res.value },
                    ),
                );
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
            if (!(target instanceof enumStruct)) return this.failedOfNotInstOf(enumStruct);
            const varRes = this.from(variant).exec(target.variant);
            if (varRes.isErr()) {
                this.failed(
                    MatchFailedError.new(`Target <enum> has incompatible variant.`, { cause: varRes.value }),
                );
            }
            const valRes = this.from(value).exec(target.value);
            if (valRes.isErr()) {
                this.failed(
                    MatchFailedError.new(`Target <enum> has incompatible value.`, { cause: valRes.value }),
                );
            }
            return varRes.isOk() && valRes.isOk();
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
            return func.match(res) && res.bind(Pattern) || res;
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
