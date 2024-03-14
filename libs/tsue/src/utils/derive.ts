import { Architecture } from "../architecture/arch.ts";
import { ConsTuple } from "../hierarchy/constructor.ts";

export function $Derive<const T extends ConsTuple = [any, ...any[]]>(...impls: T) {
    return Architecture.from(...impls).mixin();
}
