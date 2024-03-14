import { Ordering } from "./ordering.ts";
import { PartialCmp } from "./partial-cmp.ts";

export interface Cmp<T = PartialCmp> {
    cmp(rhs: T): Ordering;
}

export class Cmp<T extends PartialCmp> implements Cmp<T> {
    static naiveCmp<T>(lhs: T, rhs: T) {
        if (lhs === rhs) return Ordering.Equal;
    }

    static cmp<T>(lhs: T, rhs: T): Ordering {
        switch (typeof lhs) {
            case "string":
                return PartialCmp.stringPartialCmp(lhs, rhs as string);
            case "number":
            case "bigint":
                return PartialCmp.numberPartialCmp(lhs, rhs as number | bigint);
            case "boolean":
            case "symbol":
            case "object":
            case "function":
            case "undefined":
            default:
                if (lhs === rhs) {
                    return Ordering.Equal;
                }
                throw Error("");
        }
    }
    cmp(this: T, rhs: T): Ordering {
        return Cmp.cmp(this, rhs);
    }
}
