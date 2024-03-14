enum ResultVariant {
    Ok,
    Err,
}

const ResultType = Symbol();
const ResultRes = Symbol();

type ResultRes<T, E, V extends ResultVariant> = V extends ResultVariant.Ok ? T : E;

abstract class __Result<T = unknown, E = Error, V extends ResultVariant = ResultVariant> {
    declare [ResultType]: V;
    declare [ResultRes]: V extends ResultVariant.Ok ? T : E;

    public unwrap(): ResultRes<T, E, V> {
        if (this[ResultType] === ResultVariant.Err) {
            throw this[ResultRes];
        }
        return this[ResultRes];
    }

    public isOk() {
        return this[ResultType] === ResultVariant.Ok;
    }

    public isErr() {
        return !this.isOk();
    }
}

class __Err<T = unknown, E extends Error = Error> extends __Result<T, E, ResultVariant.Err> {
    [ResultType] = ResultVariant.Err as const;
    [ResultRes]: E;
    constructor(err: E) {
        super();
        this[ResultRes] = err;
    }
}

class __Ok<T = unknown, E extends Error = Error> extends __Result<T, E, ResultVariant.Ok> {
    [ResultType] = ResultVariant.Ok as const;
    [ResultRes]: T;
    constructor(buf: T) {
        super();
        this[ResultRes] = buf;
    }
}

export function Ok<const T, const E extends Error = Error>(buf: T) {
    return new __Ok<T, E>(buf);
}

export function Err<const T>(msg: string): __Err<T, Error>;
export function Err<const T, const E extends Error = Error>(err: E): __Err<T, E>;
export function Err<const T, const E extends Error = Error>(errOrMsg: E | string) {
    if (typeof errOrMsg === "string") return new __Err<T, Error>(new Error(errOrMsg));
    return new __Err<T, E>(errOrMsg);
}

export type Ok<T = unknown, E extends Error = Error> = __Ok<T, E>;
export type Err<T = unknown, E extends Error = Error> = __Err<T, E>;
export type Result<T = unknown, E extends Error = Error> = Ok<T, E> | Err<T, E>;

export const isOk = <T, E extends Error>(val: unknown): val is Ok<T, E> => {
    return val instanceof __Result && val[ResultType] === ResultVariant.Ok;
};

export const isErr = <T, E extends Error>(val: unknown): val is Err<T, E> => {
    return val instanceof __Result && val[ResultType] === ResultVariant.Ok;
};
