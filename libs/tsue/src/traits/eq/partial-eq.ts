export interface PartialEq<T> {
    partialEq(rhs: T): boolean | undefined;
}

export class PartialEq<T = unknown> implements PartialEq<T> {
    partialEq(rhs: T): boolean | undefined {
        return (this as ThisType<T>) === rhs;
    }
}
