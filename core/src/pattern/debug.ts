import { EnumOfADT } from "../adt/mod.ts";
import { Option } from "../enums/option.ts";
import { Result } from "../enums/result.ts";
import { PropPath } from "../prop-path/prop-path.ts";
import type { Clone } from "../traits/clone.ts";
import { expr } from "../utils/expr.ts";
import type { ConstructorType } from "../vanilla/ctor.ts";
import type { TypeOfName } from "../vanilla/typeof.ts";
import { MatchFailedError } from "./error.ts";
import type { Pattern } from "./pattern.ts";

interface IMatchFailedMeta {
    NotTypeOf: TypeOfName;
    NotEqualTo: unknown;
    NotInstanceOf: ConstructorType;
    NotConstructorOf: unknown;
    NotMatchAtIndex: number;
    NotMatchAtProp: string;
    NotMatchAnyOfUnion: void;
    NotMatchIntersection: number;
    NotMatchEnumVariant: string | Pattern<string>;
    NotMatchEnumValue: void;
    NotNever: void;
    MissingProp: void;
}

export class MatchFailedReason<
    V extends keyof IMatchFailedMeta = keyof IMatchFailedMeta,
> extends EnumOfADT<IMatchFailedMeta, V> {}

export class PatternDebug<T = any> implements Clone {
    tracker: PropPath<T>;
    result: Option<Result<undefined, MatchFailedError>> = Option.None();

    constructor(tracker: PropPath<T>) {
        this.tracker = tracker;
    }

    clone(): typeof this {
        return new PatternDebug(this.tracker.clone()) as this;
    }

    dive(prop: keyof T): PatternDebug<T> {
        return new PatternDebug(this.tracker.prop(prop));
    }

    static inst<T>(tracker: PropPath<T>): PatternDebug<T> {
        return new this(tracker);
    }

    static fromSource<T>(source: T): PatternDebug<T> {
        return this.inst(PropPath.from(source));
    }

    success(): true {
        this.result.replace(Result.Ok(void 0));
        return true;
    }

    path(): string {
        return this.tracker.debug().replace("$", "Target");
    }

    fail(meta: MatchFailedReason, cause?: MatchFailedError): false {
        const distribute = meta.asADT();
        const { variant, value } = distribute;
        const path = this.path();
        const errorMsg = expr(() => {
            switch (variant) {
                case "NotTypeOf":
                    return `${path} is not type of "${value}"`;
                case "NotEqualTo":
                    return `${path} is not equal to "${value}"`;
                case "NotInstanceOf":
                    return `${path} is not instance of "${value.name}"`;
                case "NotConstructorOf":
                    return `${path} is not constructor of "${value}"`;
                case "NotMatchAtIndex":
                    return `${path} failed to match at index ["${value}"]`;
                case "NotMatchAtProp":
                    return `${path} failed to match on property ["${value}"]`;
                case "NotMatchAnyOfUnion":
                    return `${path} failed to match any child of union type.`;
                case "NotMatchIntersection":
                    return `${path} failed to match the intersection type at index ["${value}"].`;
                case "NotMatchEnumVariant":
                    return `${path} failed to match the enum variant "${value}".`;
                case "NotMatchEnumValue":
                    return `${path} failed to match the enum value.`;
                case "NotNever":
                    return `${path} is not never.`;
                case "MissingProp":
                    return `${path} is missing prop ["${value}"].`;
            }
        });
        const error = MatchFailedError.inst(errorMsg, {
            cause,
        });
        this.result.replace(Result.Err(error));
        return false;
    }
}
