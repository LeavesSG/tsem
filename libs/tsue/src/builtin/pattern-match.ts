import { Pattern } from "./pattern/pattern.ts";

export type Case<C, R> = {
    pat: C;
    cb: (args: C) => R;
};

function switchCase<const C, R>(pat: C, cb: (arg: C) => R): Case<C, R> {
    return { pat, cb };
}

export type Exhaustive<Cases extends Case<any, unknown>[]> = Cases[number]["pat"];

type MapToCases<T extends any[], Return, _Mapped extends any[] = []> = T extends [infer R, ...infer Rest extends any[]]
    ? MapToCases<Rest, Return, [..._Mapped, [Pattern<R>, (matched: R) => Return]]>
    : _Mapped;

function match<const R, T>(
    _t: T,
    ..._cbs: MapToCases<UnionToTuple<T>, R> & [any, (arg: any) => R][]
): R {
    return [_t, _cbs] as any;
}

interface Apple {
    eat(): void;
}

interface Coffee {
    drink(): void;
}

interface Bed {
    sleep(): void;
}

enum S {
    Apple,
    Coffee,
    Bed,
}
type A = Apple | Coffee | Bed;
let x: S = {} as S;
let s = {} as any;
let str = "" as string;
const s1 = match(x, [s, (arg) => str], [s, (arg) => str], [s, (arg) => str]);
