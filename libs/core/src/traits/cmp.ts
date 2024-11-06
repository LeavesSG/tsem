import type { Ordering, PartialOrdering } from "../enums/ordering.ts";

/**
 * Try compare with another object(may with a different type), and return partial a order.
 */
export abstract class PartialCmp<Rhs = typeof this> {
    abstract partialCmp(this: this, rhs: Rhs): PartialOrdering;
}

/**
 * Try compare with another object(may with a different type), and return an order.
 */
export abstract class Cmp<Rhs = typeof this> extends PartialCmp<Rhs> {
    abstract cmp(this: this, rhs: Rhs): Ordering;
}
