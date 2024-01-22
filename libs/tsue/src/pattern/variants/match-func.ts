export type MatchFuncPattern<T = unknown> = (val: unknown) => val is T;

export type FromMatchFuncPattern<T extends MatchFuncPattern> = T extends MatchFuncPattern<infer R>
    ? R
    : never;

const MATCH_FUNC_TEST_CASES = [void 0, 0, true, false, [], {}, Symbol()];
export function isMatchFuncPattern(val: unknown): val is MatchFuncPattern {
    if (typeof val !== "function") return false;
    if (val.length !== 1) return false;
    try {
        return MATCH_FUNC_TEST_CASES.map((item) => val(item)).every((res) =>
            typeof res === "boolean"
        );
    } catch (_) {
        return false;
    }
}
