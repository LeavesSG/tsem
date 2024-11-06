import type { EnumOfADT } from "../adt/mod.ts";
import type { PHANTOM_MARKER } from "../shared/mod.ts";

export class UnwrapError extends Error {
    static fromEnum<const I extends EnumOfADT<any, any>>(
        targetEnum: I,
        requiredVariant: keyof I[typeof PHANTOM_MARKER] & string,
    ) {
        const enumName = targetEnum.constructor.name;
        return new this(
            `Tried to unwrap an enum while variant is incompatible. Required variant is ${enumName}.${requiredVariant}, given is ${enumName}.${targetEnum.variant}`,
        );
    }
}
