export {
    isPrimitiveName,
    isPrimitiveType,
    PRIMITIVE_CTOR_DICT,
    PRIMITIVE_NAMES,
} from "./primitive.ts";
export type {
    PrimitiveDict,
    PrimitiveName,
    PrimitiveType,
} from "./primitive.ts";

export {
    isTypeOf,
    isTypeOfNames,
    TYPEOF_CTOR_DICT,
    TYPEOF_NAMES,
} from "./typeof.ts";
export type { TypeOf, TypeOfDict, TypeOfName } from "./typeof.ts";

export type { FunctionType } from "./func.ts";
export { isWeakKey } from "./map.ts";
export type { ObjKey } from "./obj.ts";

export { CONSTRUCTOR_PROTOTYPE, isConstructorType } from "./ctor.ts";
export type { ConstructorType, InstanceIntersection } from "./ctor.ts";

export type { ConsOf, WrappedConsOf } from "./reflection.ts";
