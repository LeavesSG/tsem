import { Builders, EnumOfADT } from "../adt/mod.ts";
import { UnwrapError } from "./unwrap.ts";

interface ResultDef<T = unknown, E = Error> {
    /**
     * Operation success with return value.
     */
    Ok: T;
    /** Operation failed with {@link Error} */
    Err: E;
}

/**
 * An ADT enum indicates two states of possible result of an operation.
 *
 * @example
 * ```ts
 * const s = Result.Ok(123) as Result<number>;
 * if (s.isOk()) s.value.toFixed();
 * if (s.isErr()) throw s.value;
 * ```
 */
@Builders("Ok", "Err")
export class Result<
    T = unknown,
    E extends Error = Error,
    V extends keyof ResultDef<T, E> = keyof ResultDef,
> extends EnumOfADT<ResultDef<T, E>, V> {
    /**
     * Builder for variant `Ok`.
     */
    declare static Ok: <const T, E extends Error>(
        value: T,
    ) => Result<T, E, "Ok">;
    /**
     * Builder for variant `Err`.
     */
    declare static Err: <const T, E extends Error>(
        err: E,
    ) => Result<T, E, "Err">;

    /**
     * Predicate to indicates `this` is of `Ok` variant.
     */
    isOk(): this is this & Result<T, E, "Ok"> {
        return this.isVariant("Ok");
    }

    /**
     * Predicate to indicates `this` is of `Err` variant.
     */
    isErr(): this is this & Result<T, E, "Err"> {
        return this.isVariant("Err");
    }

    /**
     * Ensure that this is of `Ok` variant and return its value, else throw an {@link UnwrapError}.
     */
    unwrap(): T & this["value"] {
        if (!this.isOk()) throw UnwrapError.fromEnum(this, "Ok");
        return this.value;
    }
}
