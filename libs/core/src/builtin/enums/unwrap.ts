import type { PhantomMarker } from "../../types/phantom.ts";
import type { EnumStruct } from "../enum-struct/mod.ts";

export class UnwrapError extends Error {
    static fromEnum<const I extends EnumStruct<any, any>>(
        targetEnum: I,
        requiredVariant: keyof I[PhantomMarker] & string,
    ) {
        const enumName = targetEnum.constructor.name;
        return new this(
            `Tried to unwrap an enum while variant is incompatible. Required variant is ${enumName}.${requiredVariant}, given is ${enumName}.${targetEnum.variant}`,
        );
    }
}
