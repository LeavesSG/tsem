export type FunctionType<T extends unknown[] = never[], R = unknown> = (...args: T) => R;
