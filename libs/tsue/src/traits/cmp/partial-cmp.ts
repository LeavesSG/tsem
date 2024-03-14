import { Ordering, PartialOrdering } from "./ordering.ts";

export interface PartialCmp<T = unknown> {
    partialCmp(rhs: T): PartialOrdering;
}

export class PartialCmp<T> implements PartialCmp<T> {
    static stringPartialCmp(lhs: string, rhs: string): Ordering {
        return lhs.localeCompare(rhs);
    }
    static numberPartialCmp(lhs: number | bigint, rhs: number | bigint): Ordering {
        if (lhs > rhs) {
            return Ordering.Greater;
        } else if (lhs === rhs) {
            return Ordering.Equal;
        } else {
            return Ordering.Less;
        }
    }
    static naiveCmp<T>(lhs: T, rhs: T): PartialOrdering {
        if (lhs === rhs) return Ordering.Equal;
        return undefined;
    }
    static partialCmp<T>(lhs: T, rhs: T): PartialOrdering {
        switch (typeof lhs) {
            case "string":
                return this.stringPartialCmp(lhs, rhs as string);
            case "number":
            case "bigint":
                return this.numberPartialCmp(lhs, rhs as number | bigint);
            case "boolean":
            case "symbol":
            case "object":
            case "function":
            case "undefined":
                return undefined;
        }
    }
    partialCmp(this: T, rhs: T): PartialOrdering {
        return PartialCmp.partialCmp(this, rhs);
    }
}
