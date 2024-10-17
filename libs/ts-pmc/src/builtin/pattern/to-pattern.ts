import type { Pattern } from "./pattern.ts";

export const TO_PATTERN = Symbol("[Pattern]:to pattern");

export interface ToPattern<T = any> {
    [TO_PATTERN](): Pattern<T>;
}

export const implToPattern = (target: unknown): target is ToPattern<unknown> => {
    if (target === undefined || target === null) return false;
    switch (typeof target) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
        case "symbol":
            return TO_PATTERN in Object.getPrototypeOf(target);
        case "object":
        case "function":
            return TO_PATTERN in target;
        default:
            return false;
    }
};
