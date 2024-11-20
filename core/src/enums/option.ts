import { Builders, EnumOfADT } from "../adt/mod.ts";
import { UnwrapError } from "./unwrap.ts";

interface OptionDef<T = unknown> {
    /** Inidcate a value is exist. */
    Some: T;
    /** Indicate value not exist. */
    None: void;
}

/**
 * An ADT enum indicates two states of value's existance.
 *
 * @example
 * ```ts
 * const s = Option.Some(123) as Option<number>;
 * if (s.isSome()) s.value.toFixed();
 * if (s.isNone()) s.value; // void 0
 * ```
 */
@Builders("Some", "None")
export class Option<
    const T = unknown,
    V extends keyof OptionDef<T> = keyof OptionDef<T>,
> extends EnumOfADT<OptionDef<T>, V> {
    /**
     * Builder for variant `Some`.
     */
    declare static Some: <const T>(value: T) => Option<T, "Some">;
    /**
     * Builder for variant `None`.
     */
    declare static None: <const T>() => Option<T, "None">;

    /**
     * Predicate to indicates `this` is of `Some` variant.
     */
    isSome(): this is this & Option<T, "Some"> {
        return this.isVariant("Some");
    }

    /**
     * Predicate to indicates `this` is of `None` variant.
     */
    isNone(): this is this & Option<T, "None"> {
        return this.isVariant("None");
    }

    /**
     * Ensure that this is of `Some` variant and return its value, else throw an {@link UnwrapError}.
     */
    unwrap(): T & this["value"] {
        if (!this.isSome()) throw UnwrapError.fromEnum(this, "Some");
        return this.value;
    }

    /**
     * Repale value of this with provided value, and replace variant with `Some`.
     */
    replace(value: T): this is Option<T, "Some"> {
        this.value = value as never;
        this.variant = "Some" as never;
        return true;
    }
}
