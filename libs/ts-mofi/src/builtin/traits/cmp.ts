import { Ordering, PartialOrdering } from "../enums/ordering.ts";

export abstract class PartialCmp<Rhs = typeof this> {
    abstract partialCmp(this: this, rhs: Rhs): PartialOrdering;
}

export abstract class Cmp<Rhs = typeof this> extends PartialCmp<Rhs> {
    abstract cmp(this: this, rhs: Rhs): Ordering;
}
