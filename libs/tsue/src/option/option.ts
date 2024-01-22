enum OptionVariant {
    Some,
    None,
}

const OptionType = Symbol();
const OptionBuf = Symbol();

abstract class __Option<T = unknown> {
    declare [OptionType]: OptionVariant;
    declare [OptionBuf]: T | undefined;

    public isSome(): this is __Some<T> {
        return this[OptionType] === OptionVariant.Some;
    }

    public isNone(): this is __None<T> {
        return !this.isSome();
    }

    public unwrap(): T {
        if (this.isNone()) {
            throw new Error("Error: Call 'unwrap' on Option.None!");
        }
        return (this as __Some<T>)[OptionBuf];
    }
}

class __None<T = unknown> extends __Option<T> {
    [OptionType] = OptionVariant.None;
    [OptionBuf] = undefined;
}

class __Some<T = unknown> extends __Option<T> {
    [OptionType] = OptionVariant.Some;
    [OptionBuf]: T;
    constructor(buf: T) {
        super();
        this[OptionBuf] = buf;
    }
}

export function Some<const T>(buf: T) {
    return new __Some(buf);
}

export function None<T>() {
    return new __None<T>();
}

export type Some<T = unknown> = __Some<T>;
export type None<T = unknown> = __None<T>;
