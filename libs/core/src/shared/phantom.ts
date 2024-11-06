/**
 * A type that act as it *used* a given parameter type `T`.
 */
export type PhantomData<T> = T extends never ? never : never;

/**
 * A symbol used for marking phantom data.
 */
export const PHANTOM_MARKER = Symbol("Phantom Data");

/**
 * Type that has a phantom marker.
 */
export interface PhantomMarked<T> {
    [PHANTOM_MARKER]: T;
}
