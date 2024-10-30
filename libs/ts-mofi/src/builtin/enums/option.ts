import { builder, EnumStruct } from "../enum-struct/mod.ts";
import { UnwrapError } from "./unwrap.ts";

interface OptionDef<T = unknown> {
    Some: T;
    None: never;
}

export class Option<const T = unknown, V extends keyof OptionDef<T> = keyof OptionDef<T>>
    extends EnumStruct<OptionDef<T>, V>
{
    static Some = builder(this, "Some") as <const T>(item: T) => Option<T, "Some">;
    static None = builder(this, "None") as <const T>() => Option<T, "None">;

    isSome(): this is this & Option<T, "Some"> {
        return this.isVariant("Some");
    }

    isNone(): this is this & Option<T, "None"> {
        return this.isVariant("None");
    }

    unwrap(): T & this["value"] {
        if (!this.isSome()) throw UnwrapError.fromEnum(this, "Some");
        return this.value;
    }

    replace(value: T): this is Option<T, "Some"> {
        this.value = value as never;
        this.variant = "Some" as never;
        return true;
    }
}
