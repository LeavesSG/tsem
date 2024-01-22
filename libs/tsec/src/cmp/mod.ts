export enum Ordering {
    Less = -1,
    Equal = 0,
    Greater = 1,
}

export type PartialOrdering = Ordering | undefined;

export interface PartialCmp<T = unknown> {
    partialCmp(other: T): PartialOrdering;
}

export interface Cmp<T = unknown> extends PartialCmp<T> {
    cmp(other: T): Ordering;
}
