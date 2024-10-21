import type { ConstructorType } from "../../types/cons.ts";
import type { Pattern } from "./pattern.ts";

export const SYMBOL_TO_PATTERN = Symbol("[Pattern]:to pattern");

export interface ToPattern<T = any> {
    [SYMBOL_TO_PATTERN](): Pattern<T>;
}

export const hasImplToPattern = (target: unknown): target is ToPattern<any> => {
    if (target === undefined || target === null) return false;
    switch (typeof target) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
        case "symbol":
            return SYMBOL_TO_PATTERN in Object.getPrototypeOf(target);
        case "object":
        case "function":
            return SYMBOL_TO_PATTERN in target;
        default:
            return false;
    }
};

export const implToPattern = <T>(
    ctor: ConstructorType<T>,
    impl: { toPattern: ToPattern[typeof SYMBOL_TO_PATTERN] } & ThisType<T>,
) => {
    Object.defineProperty(ctor.prototype, SYMBOL_TO_PATTERN, {
        value: impl.toPattern,
    });
};
