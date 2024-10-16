export const UNKNOWN_PATTERN = Symbol("[PatternMarker]: unknown");

export type UnknownMaker = typeof UNKNOWN_PATTERN;

export const isUnknownMarker = (candidate: unknown): candidate is UnknownMaker => candidate === UNKNOWN_PATTERN;

export const _: UnknownMaker = UNKNOWN_PATTERN;
