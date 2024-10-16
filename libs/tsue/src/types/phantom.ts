export type PhantomData<T> = T extends never ? never : never;

export const PHANTOM_DATA = Symbol("Phantom Data");

export type PhantomMarker = typeof PHANTOM_DATA;
