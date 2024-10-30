import { Ordering, PartialOrdering } from "../enums/ordering.ts";

export interface PartialCmp<Rhs = typeof this> {
    partialCmp(this: this, rhs: Rhs): PartialOrdering;
}

export interface Cmp<Rhs = typeof this> extends PartialCmp<typeof this> {
    cmp(this: this, rhs: Rhs): Ordering;
}
