export type PhantomData<T> = T extends never ? never : never;

export const PHANTOM_MARKER = Symbol("Phantom Data");

export type PhantomMarker = typeof PHANTOM_MARKER;
