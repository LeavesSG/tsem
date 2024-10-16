import { EnumStruct, genericBuilder } from "../enum-struct/mod.ts";

interface IOption<T> {
    Some: T;
    None: never;
}

export class Option<const T = unknown> extends EnumStruct<IOption<T>> {
    static Some = genericBuilder(this, "Some") as <const T>(item: T) => Option<T>;
    static None = genericBuilder(this, "None") as <const T>() => Option<T>;
}
