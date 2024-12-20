import type { EnumOfADT } from "../adt/mod.ts";
import { Result } from "../enums/mod.ts";
import type {
    ParsePatExpr,
    PatExpressions,
    PossiblePatExpr,
} from "../pattern/mod.ts";
import { _, Pattern } from "../pattern/mod.ts";
import { SYMBOL_PHANTOM } from "../shared/mod.ts";
import type { UnionToTuple } from "../utils/union-type.ts";

type OnMatched<R, E> = (expr: E) => R;

interface Case<S = unknown, R = unknown, T extends PatExpressions = unknown> {
    pat: T;
    onMatched: OnMatched<R, S & ParsePatExpr<T>>;
}

export class MatchCasesNotExhaustiveError extends Error {}

class MatchOngoing<S = unknown, C extends Case<S, any, any>[] = []> {
    private source: S;
    private cases: C;
    declare [SYMBOL_PHANTOM]: {
        uncover: Uncovered<S, C>;
        covered: MatchCovered<C>;
        exhaustive: IfExhaustive<S, C>;
    };

    constructor(source: S, ...cases: C) {
        this.source = source;
        this.cases = cases;
    }

    when<
        R,
        const T extends PossiblePatExpr<UnionToTuple<Uncovered<S, C>>[number]>,
    >(
        pat: T,
        ifMatched: OnMatched<R, S & ParsePatExpr<T>>,
    ): CreateMatchObj<S, C, R, T>;
    when<R, const T extends PatExpressions = typeof _>(
        pat: T,
        ifMatched: OnMatched<R, S & ParsePatExpr<T>>,
    ): CreateMatchObj<S, C, R, T>;
    when(
        pat: any,
        ifMatched: any,
    ): CreateMatchObj<S, C, any, any> {
        return new MatchExhausted(this.source, ...this.cases, {
            pat,
            onMatched: ifMatched,
        });
    }

    default<R = unknown>(
        ifMatched: OnMatched<R, S & typeof _>,
    ): MatchExhausted<S, [...C, {
        pat: Pattern<unknown>;
        onMatched: OnMatched<R, S & Pattern<unknown>>;
    }]> {
        return new MatchExhausted(this.source, ...this.cases, {
            pat: _,
            onMatched: ifMatched,
        });
    }

    tryExec(): Result<MatchRet<C>, MatchCasesNotExhaustiveError> {
        const { source } = this;
        for (const { pat, onMatched } of this.cases) {
            const pattern = Pattern.from(pat);
            if (pattern.match(source)) return Result.Ok(onMatched(source));
        }
        throw new MatchCasesNotExhaustiveError(
            `Execute a match case without covering all possible arms! Actual value!: ${this.source}, arms: ${this.cases}`,
        );
    }

    forceExhaustive(): MatchExhausted<S, C> {
        return this as never;
    }
}

export class Match<S> extends MatchOngoing<S, []> {
    static match<const S extends EnumOfADT<any, any>>(
        source: S,
    ): Match<MatchSplitEnum<S>>;
    static match<S>(source: S): Match<S>;
    static match<S>(source: S) {
        return new this(source);
    }
}

class MatchExhausted<S = unknown, C extends Case<any, any, any>[] = []>
    extends MatchOngoing<S, C> {
    exec(): MatchRet<C> {
        return this.tryExec().unwrap();
    }
}

type MatchRet<C extends Case<any, any, any>[], __R = never> = C extends
    [Case<any, infer R, any>, ...infer Rest extends Case<any, any, any>[]]
    ? MatchRet<Rest, __R | R>
    : __R;

type MatchCovered<C extends Case<any, any, any>[], __R = never> = C extends
    [Case<any, any, infer R>, ...infer Rest extends Case<any, any, any>[]]
    ? MatchCovered<Rest, __R | ParsePatExpr<R>>
    : __R;

type IfExhaustive<S, C extends Case<any, any, any>[]> = S extends
    MatchCovered<C> ? true : false;

type Uncovered<S, C extends Case<any, any, any>[]> = Exclude<
    S,
    MatchCovered<C>
>;

type CreateMatchObj<S, C extends Case<any, any, any>[], R, T> =
    IfExhaustive<S, [...C, Case<S, R, T>]> extends true
        ? MatchExhausted<S, [...C, Case<S, R, T>]>
        : MatchOngoing<S, [...C, Case<S, R, T>]>;

type MatchSplitEnum<Es extends EnumOfADT<any, any>> = Es extends
    EnumOfADT<infer Def, infer Var> ? SplitVariant<Es, Def, Var>
    : Es;

type SplitVariant<Es, Def, Var> = Var extends keyof Def ? Es & {
        variant: Var;
        value: Def[Var];
    }
    : never;

export const match: {
    <const S extends EnumOfADT<any, any>>(source: S): Match<MatchSplitEnum<S>>;
    <S>(source: S): Match<S>;
} = Match.match.bind(Match);
