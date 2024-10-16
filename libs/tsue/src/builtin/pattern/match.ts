import { PatExpressions } from "./expr.ts";
import { Pattern } from "./obj.ts";

export interface Case<Expr extends PatExpressions = PatExpressions, Res = unknown> {
    expr: Expr;
    cb: (matched: Expr) => Res;
}

export function match<Source = unknown, Res = unknown>(source: Source, ...cases: Case<any, Res>[]) {
    for (const matchCase of cases) {
        const pattern = Pattern.from(matchCase.expr);
        if (!pattern.match(source)) continue;
        return matchCase.cb(source);
    }
}

export function matchCase<Expr extends PatExpressions = PatExpressions, Res = unknown>(
    expr: Expr,
    cb: (matched: Expr) => Res,
) {
    return { expr, cb };
}
