export type LiteralPattern = unknown;

export type FromLiteralPattern<T> = T;

export function isLiteralPattern(_: unknown): _ is LiteralPattern {
    return true;
}
