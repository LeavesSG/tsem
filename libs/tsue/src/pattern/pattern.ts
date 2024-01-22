import { debugPrint } from "../debug/debug-print.ts";
import { IndexTracing } from "../obj-path/obj-path.ts";
import { Debug } from "../traits/debug.ts";
import { FromPattern } from "./transform.ts";
import { PatternBuf, PatternType } from "./variants.ts";
import { ArrayPatternKey, isArrayPattern } from "./variants/array.ts";
import { ConstructorPattern, FromConstructorPattern, isConstructorPattern } from "./variants/constructor.ts";
import { LiteralPattern } from "./variants/literal.ts";
import { FromMatchFuncPattern, isMatchFuncPattern, MatchFuncPattern } from "./variants/match-func.ts";
import { FromPrimitivePattern, isPrimitivePattern, PrimitivePattern } from "./variants/primitive.ts";
import { isRegExpPattern, RegExpPattern } from "./variants/regexp.ts";
import { isStructPattern, StructPattern } from "./variants/struct.ts";
import { FromTuplePattern, isTuplePattern, TuplePattern } from "./variants/tuple.ts";
import { FromUnionPattern, isUnionPattern, UnionPatternKey } from "./variants/union.ts";

export class Pattern<B = unknown, T extends PatternType = PatternType> implements Debug {
    type: T;
    buf: PatternBuf<T>;
    constructor(buf: PatternBuf<T>, pattern: T) {
        this.buf = buf;
        this.type = pattern;
    }

    static fromPrimitive<const T extends PrimitivePattern>(
        buf: T,
    ) {
        switch (buf) {
            case "boolean":
            case Boolean:
                return new this<FromPrimitivePattern<T>, PatternType.Primitive>(
                    "boolean",
                    PatternType.Primitive,
                );
            case "number":
            case Number:
                return new this<FromPrimitivePattern<T>, PatternType.Primitive>(
                    "number",
                    PatternType.Primitive,
                );
            case "bigint":
            case BigInt:
                return new this<FromPrimitivePattern<T>, PatternType.Primitive>(
                    "bigint",
                    PatternType.Primitive,
                );
            case "string":
            case String:
                return new this<FromPrimitivePattern<T>, PatternType.Primitive>(
                    "string",
                    PatternType.Primitive,
                );
            case "symbol":
            case Symbol:
                return new this<FromPrimitivePattern<T>, PatternType.Primitive>(
                    "symbol",
                    PatternType.Primitive,
                );
        }
    }

    static fromRegExp(buf: RegExp) {
        return new this<string, PatternType.RegExp>(buf, PatternType.RegExp);
    }

    static fromConstructor<const T extends ConstructorPattern>(
        buf: T,
    ) {
        return new this<FromConstructorPattern<T>, PatternType.Constructor>(
            buf,
            PatternType.Constructor,
        );
    }

    static fromMatchFunc<const T extends MatchFuncPattern>(
        buf: T,
    ) {
        return new this<FromMatchFuncPattern<T>, PatternType.MatchFunc>(
            buf,
            PatternType.MatchFunc,
        );
    }

    static fromArray<const T>(buf: T) {
        return new this<FromPattern<T>[], PatternType.Array>(
            this.from(buf),
            PatternType.Array,
        );
    }

    static fromTuple<const T extends TuplePattern>(
        buf: [...T],
    ) {
        return new this<FromTuplePattern<T>, PatternType.Tuple>(
            buf.map((pat) => this.from(pat)),
            PatternType.Tuple,
        );
    }

    static fromUnion<const T extends TuplePattern>(
        buf: [...T],
    ) {
        return new this<FromUnionPattern<{ [UnionPatternKey]: T }>, PatternType.Union>(
            buf.map((pat) => this.from(pat)),
            PatternType.Union,
        );
    }

    static fromStruct<const T extends StructPattern>(
        buf: T,
    ) {
        return new this<{ -readonly [K in keyof T]: FromPattern<T[K]> }, PatternType.Struct>(
            Object.fromEntries(
                Object.entries(buf).map(([key, val]) => {
                    return [key, Pattern.from(val)];
                }),
            ),
            PatternType.Struct,
        );
    }

    static fromLiteral<const T extends LiteralPattern>(buf: T) {
        return new this<T, PatternType.Literal>(buf, PatternType.Literal);
    }

    static from<const T extends PrimitivePattern>(
        buf: T,
    ): Pattern<FromPrimitivePattern<T>, PatternType.Primitive>;
    static from<const T extends RegExpPattern>(buf: T): Pattern<string, PatternType.RegExp>;
    static from<const T extends ConstructorPattern>(
        buf: T,
    ): Pattern<FromConstructorPattern<T>, PatternType.Constructor>;
    static from<const T extends MatchFuncPattern>(
        buf: T,
    ): Pattern<FromMatchFuncPattern<T>, PatternType.MatchFunc>;
    static from<const T>(
        buf: { [ArrayPatternKey]: T },
    ): Pattern<FromPattern<T>[], PatternType.Array>;
    static from<const T extends TuplePattern>(
        buf: [...T],
    ): Pattern<FromTuplePattern<T>, PatternType.Tuple>;
    static from<const T extends TuplePattern>(
        buf: { [UnionPatternKey]: [...T] },
    ): Pattern<FromUnionPattern<{ [UnionPatternKey]: T }>, PatternType.Struct>;
    static from<const T extends StructPattern>(
        buf: T,
    ): Pattern<{ -readonly [K in keyof T]: FromPattern<T[K]> }>;
    static from<const T extends LiteralPattern>(buf: T): Pattern<T, PatternType.Literal>;
    static from<T>(buf: T): FromPattern<T> {
        if (buf instanceof this) return buf as FromPattern<T>;
        switch (typeof buf) {
            case "string":
                if (isPrimitivePattern(buf)) {
                    return this.fromPrimitive(buf) as FromPattern<T>;
                }
                break;
            case "object":
                if (isRegExpPattern(buf)) {
                    return this.fromRegExp(buf) as FromPattern<T>;
                }
                if (isTuplePattern(buf)) {
                    return this.fromTuple(buf) as FromPattern<T>;
                }
                if (isUnionPattern(buf)) {
                    return this.fromUnion(buf[UnionPatternKey]) as FromPattern<T>;
                }
                if (isArrayPattern(buf)) {
                    return this.fromArray(buf[ArrayPatternKey]) as FromPattern<T>;
                }
                if (isStructPattern(buf)) {
                    return this.fromStruct(buf) as FromPattern<T>;
                }
                break;
            case "function":
                if (isPrimitivePattern(buf)) {
                    return this.fromPrimitive(buf) as FromPattern<T>;
                }
                if (isConstructorPattern(buf)) {
                    return this.fromConstructor(buf) as FromPattern<T>;
                }
                if (isMatchFuncPattern(buf)) {
                    return this.fromMatchFunc(buf) as FromPattern<T>;
                }
                break;
        }
        return this.fromLiteral(buf) as FromPattern<T>;
    }

    match(val: unknown, logLevel?: "info" | "log" | "warn" | "error"): val is B {
        try {
            this.assert(val);
            return true;
        } catch (error) {
            logLevel && console[logLevel]?.(error);
            return false;
        }
    }

    assert(val: unknown, env: { input: IndexTracing; pattern: IndexTracing<Pattern> } = {
        input: new IndexTracing(val, []),
        pattern: new IndexTracing<Pattern>(this, []),
    }): val is B {
        let matchRes = true;
        env.pattern.buffer.push("buf");
        switch (this.type) {
            case PatternType.Array: {
                const buf = this.buf as PatternBuf<PatternType.Array>;
                matchRes = Array.isArray(val) && val.every((item, index) =>
                    buf.assert(item, {
                        ...env,
                        input: env.input.add(index),
                    })
                );
                break;
            }
            case PatternType.Primitive: {
                const buf = this.buf as PatternBuf<PatternType.Primitive>;
                matchRes = (typeof val) === buf;
                break;
            }

            case PatternType.RegExp: {
                const buf = this.buf as PatternBuf<PatternType.RegExp>;
                matchRes = typeof val === "string" && buf.test(val);
                break;
            }
            case PatternType.Constructor: {
                const buf = this.buf as PatternBuf<PatternType.Constructor>;
                matchRes = val instanceof buf;
                break;
            }
            case PatternType.MatchFunc: {
                const buf = this.buf as PatternBuf<PatternType.MatchFunc>;
                matchRes = buf(val);
                break;
            }
            case PatternType.Tuple: {
                const buf = this.buf as PatternBuf<PatternType.Tuple>;
                matchRes = Array.isArray(val)
                    && buf.every((pattern, index) =>
                        pattern.assert(val[index], {
                            pattern: env.pattern.add(index),
                            input: env.input.add(index),
                        })
                    );
                break;
            }
            case PatternType.Union: {
                const buf = this.buf as PatternBuf<PatternType.Union>;
                try {
                    matchRes = buf.some((pattern) => pattern.assert(val, env));
                } catch (_) {
                    break;
                }
                break;
            }
            case PatternType.Struct: {
                const buf = this.buf as PatternBuf<PatternType.Struct>;
                matchRes = typeof val === "object" && !!val && Object.keys(buf).every((key) => {
                    return buf[key].assert(key in val && val[key as never], {
                        pattern: env.pattern.add(key),
                        input: env.input.add(key),
                    });
                });
                break;
            }
            case PatternType.Literal: {
                const buf = this.buf as PatternBuf<PatternType.Literal>;
                matchRes = val === buf;
                break;
            }
        }
        if (matchRes) {
            return matchRes;
        }
        throw new TypeError(
            `Match Failed! [${
                env.input.toJSONPath().replace("$", "Input")
            }: "${env.input.getValue()}"] didn't match to "${env.pattern.obj!.debug()}".`,
        );
    }

    debug(): string {
        switch (this.type) {
            case PatternType.Array: {
                const buf = this.buf as PatternBuf<PatternType.Array>;
                return `${buf.debug()}[]`;
            }

            case PatternType.Primitive: {
                const buf = this.buf as PatternBuf<PatternType.Primitive>;
                return buf;
            }

            case PatternType.RegExp: {
                const buf = this.buf as PatternBuf<PatternType.RegExp>;
                return buf.toString();
            }
            case PatternType.Constructor:
            case PatternType.MatchFunc: {
                const buf = this.buf as PatternBuf<PatternType.Constructor>;
                return debugPrint(buf);
            }

            case PatternType.Tuple: {
                const buf = this.buf as PatternBuf<PatternType.Tuple>;
                return `[${buf.map((pat) => pat.debug()).join(",")}]`;
            }

            case PatternType.Union: {
                const buf = this.buf as PatternBuf<PatternType.Union>;
                return `${buf.map((pat) => pat.debug()).join("|")}`;
            }
            case PatternType.Struct: {
                const buf = this.buf as PatternBuf<PatternType.Struct>;
                return JSON.stringify(Object.fromEntries(
                    Object.entries(buf).map(([key, val]) => {
                        return [key, val.debug()];
                    }),
                ));
            }
            case PatternType.Literal: {
                const buf = this.buf as PatternBuf<PatternType.Literal>;
                return `${buf}`;
            }
        }
        return "";
    }
}
