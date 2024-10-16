import { Ordering, PartialOrdering } from "../enums/ordering.ts";
import { MayImpl } from "../impl/impl.ts";

export interface PartialCmp<Self = unknown, Rhs = Self> {
    partialCmp(this: Self, rhs: Rhs): PartialOrdering;
}

export interface Cmp<Self extends MayImpl<PartialCmp> = MayImpl<PartialCmp>, Rhs = Self> {
    cmp(this: Self, rhs: Rhs): Ordering;
}

// declare global {
//     interface Number extends MarkImpl<PartialCmp<Number> & Cmp<Number>> {}
//     interface String extends MarkImpl<PartialCmp<String> & Cmp<String>> {}
// }
