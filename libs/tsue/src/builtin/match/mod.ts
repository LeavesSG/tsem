import { PHANTOM_DATA } from "../../types/phantom.ts";
import { UnionToTuple } from "../../utils/types.ts";
import { Result } from "../enums/result.ts";
import { ParsePatExpr, PatExpressions, PossiblePatExpr } from "../pattern/expr.ts";
import { _, UnknownMaker } from "../pattern/markers.ts";
import { Pattern } from "../pattern/obj.ts";

export type MatchedCb<R, E> = (expr: E) => R;

export interface MatchCase<R = unknown, T extends PatExpressions = unknown> {
    pat: T;
    ifMatched: MatchedCb<R, ParsePatExpr<T>>;
}

export class MatchCaseNotCoveredError extends Error {}

class MatchOngoing<S = unknown, C extends MatchCase<any, any>[] = []> {
    private source: S;
    private cases: C;
    declare [PHANTOM_DATA]: UnCovered<S, C>;

    constructor(source: S, ...cases: C) {
        this.source = source;
        this.cases = cases;
    }

    case<R, const T extends PossiblePatExpr<UnionToTuple<UnCovered<S, C>>[number]>>(
        pat: T,
        ifMatched: NoInfer<MatchedCb<R, ParsePatExpr<T>>>,
    ): CreateMatchCase<S, C, R, T> {
        return new MatchCovered(this.source, ...this.cases, { pat, ifMatched: ifMatched });
    }

    default<R = unknown>(ifMatched: MatchedCb<R, UnknownMaker>) {
        return new MatchCovered(this.source, ...this.cases, { pat: _, ifMatched: ifMatched });
    }

    forceExec(): Result<MatchCaseRes<C>, MatchCaseNotCoveredError> {
        const { source } = this;
        for (const { pat, ifMatched } of this.cases) {
            const pattern = Pattern.from(pat);
            if (pattern.match(source)) return Result.Ok(ifMatched(source));
        }
        throw new MatchCaseNotCoveredError(
            `Execute a match case without covering all possible arms! Actual value! Actual value: ${this.source}, arms: ${this.cases}`,
        );
    }
}

export class Match<S> extends MatchOngoing<S, []> {
    static match<S>(source: S) {
        return new this(source);
    }
}

class MatchCovered<S = unknown, C extends MatchCase<any, any>[] = []> extends MatchOngoing<S, C> {
    exec(): MatchCaseRes<C> {
        return this.forceExec().unwrap();
    }
}

type MatchCaseRes<C extends MatchCase<any, any>[], __R = never> = C extends
    [MatchCase<infer R, any>, ...infer Rest extends MatchCase<any, any>[]] ? MatchCaseRes<Rest, __R | R> : __R;

type MatchCaseCover<C extends MatchCase<any, any>[], __R = never> = C extends
    [MatchCase<any, infer R>, ...infer Rest extends MatchCase<any, any>[]] ? MatchCaseCover<Rest, __R | ParsePatExpr<R>>
    : __R;

type IfMatchCover<S, C extends MatchCase<any, any>[]> = S extends MatchCaseCover<C> ? true : false;

type CreateMatchCase<S, C extends MatchCase<any, any>[], R, T> = IfMatchCover<S, [...C, MatchCase<R, T>]> extends true
    ? MatchCovered<S, [...C, MatchCase<R, T>]>
    : MatchOngoing<S, [...C, MatchCase<R, T>]>;

type UnCovered<S, C extends MatchCase<any, any>[]> = Exclude<S, MatchCaseCover<C>>;
export const match = Match.match.bind(Match);
