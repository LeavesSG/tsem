import { builder, EnumStruct } from "../enum-struct/mod.ts";
import { UnwrapError } from "./unwrap.ts";

interface ResultDef<T = unknown, E = Error> {
    Ok: T;
    Err: E;
}

export class Result<T = unknown, E extends Error = Error, V extends keyof ResultDef<T, E> = keyof ResultDef>
    extends EnumStruct<ResultDef<T, E>, V>
{
    static Ok = builder(this, "Ok") as <const T, E extends Error>(value: T) => Result<T, E, "Ok">;
    static Err = builder(this, "Err") as <const T, E extends Error>(err: E) => Result<T, E, "Err">;

    isOk(): this is this & Result<T, E, "Ok"> {
        return this.isVariant("Ok");
    }

    isErr(): this is this & Result<T, E, "Err"> {
        return this.isVariant("Err");
    }

    unwrap(): T & this["value"] {
        if (!this.isOk()) throw UnwrapError.fromEnum(this, "Ok");
        return this.value;
    }
}
