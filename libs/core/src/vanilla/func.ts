export type FunctionType<Args extends unknown[] = never[], R = unknown> = (
    ...args: Args
) => R;
