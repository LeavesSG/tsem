import { todo } from "../dev.ts";
import { EnumStruct, genericBuilder } from "../enum-struct/mod.ts";

interface IResult<T = unknown, E = Error> {
    Ok: T;
    Err: E;
}

export class Result<T = unknown, E extends Error = Error> extends EnumStruct<IResult<T, E>> {
    static Ok = genericBuilder(this, "Ok") as <const T, E extends Error>(value: T) => Result<T, E>;
    static Err = genericBuilder(this, "Err") as <const T, E extends Error>(err: E) => Result<T, E>;

    unwrap(): T {
        if (!(this.isVariant("Ok"))) throw todo();
        return this.value;
    }
}
