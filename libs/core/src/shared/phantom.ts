/**
 * A type that act as it *used* a given parameter type `T`.
 */
export type PhantomData<T> = T extends never ? never : never;

/**
 * A symbol used for marking phantom data.
 */
export const SYMBOL_PHANTOM = Symbol("Phantom Data marker");

/**
 * Type that has a phantom marker.
 */
export interface PhantomMarked<T> {
    [SYMBOL_PHANTOM]: T;
}
