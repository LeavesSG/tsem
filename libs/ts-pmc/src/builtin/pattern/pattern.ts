import { isWeakKey } from "../../types/map.ts";
import { type ConstructorType, isConstructorType, isPrimitiveTypeName } from "../../types/mod.ts";
import { PRIMITIVE_TYPE_DICT } from "../../types/primitive.ts";
import { ParsePatExpr, PatExpr, PatExpressions, PatExprForm, PatExprParser } from "./expr.ts";
import { implToPattern, TO_PATTERN } from "./to-pattern.ts";
import { isUnknownMarker } from "./unknown.ts";

type PatternPredicate<T> = (target: unknown) => target is T;

const patternCache = new WeakMap<WeakKey, Pattern>();

export class Pattern<T = unknown> {
    predicate: PatternPredicate<T>;
    constructor(pred: PatternPredicate<T>) {
        this.predicate = pred;
    }

    static typeof<T extends PatExprForm[PatExpr.Primitive]>(expr: T) {
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Primitive] => {
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

    static unknown() {
        const pred = (_target: unknown): _target is unknown => {
            return true;
        };
        return new this(pred);
    }

    static instanceOf<T extends PatExprForm[PatExpr.Constructor]>(expr: T) {
        for (const [key, value] of Object.entries(PRIMITIVE_TYPE_DICT)) {
            if (value as unknown !== expr) continue;
            const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Constructor] => {
                const targetType = typeof target;
                return target instanceof expr || targetType === key;
            };
            return new this(pred);
        }
        const pred = (target: unknown): target is PatExprParser<T>[PatExpr.Constructor] => {
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

    static array<T>(expr: T): Pattern<ParsePatExpr<T>[]> {
        const pred = (target: unknown): target is ParsePatExpr<T>[] => {
            if (!(Array.isArray(target))) return false;
            const pattern = this.from(expr);
            return target.every(child => {
                return pattern.match(child);
            });
        };
        return new this(pred);
    }

    static checkCache(expr: WeakKey) {
        const cache = patternCache.get(expr);
        if (cache) return cache;
    }

    static from<const T extends PatExprForm[PatExpr.Primitive]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Primitive]>;
    static from<const T extends PatExprForm[PatExpr.ToPattern]>(expr: T): Pattern<PatExprParser<T>[PatExpr.ToPattern]>;
    static from<const T extends PatExprForm[PatExpr.Tuple]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Tuple]>;
    static from<const T extends PatExprForm[PatExpr.PatObj]>(expr: T): Pattern<PatExprParser<T>[PatExpr.PatObj]>;
    static from<const T extends PatExprForm[PatExpr.Unknown]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Unknown]>;
    static from<const T extends PatExprForm[PatExpr.Constructor]>(
        expr: T,
    ): Pattern<PatExprParser<T>[PatExpr.Constructor]>;
    static from<const T extends PatExprForm[PatExpr.Struct]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Struct]>;
    static from<const T extends PatExprForm[PatExpr.Literal]>(expr: T): Pattern<PatExprParser<T>[PatExpr.Literal]>;
    static from<const T>(expr: T) {
        if (isWeakKey(expr)) {
            const found = this.checkCache(expr);
            if (found) return found;
        }

        if (implToPattern(expr)) {
            return expr[TO_PATTERN];
        }

        if (isPrimitiveTypeName(expr)) {
            return this.typeof(expr);
        }

        if (Array.isArray(expr)) {
            return this.tuple(expr);
        } else if (expr instanceof Pattern) {
            return expr;
        } else if (isUnknownMarker(expr)) {
            return this.unknown();
        } else if (isConstructorType(expr)) {
            return this.instanceOf(expr);
        } else if (typeof expr === "object") {
            return this.struct(expr as Record<string, unknown>);
        } else {
            return this.literal(expr);
        }
    }

    match(target: unknown): target is T {
        return this.predicate(target);
    }
}
