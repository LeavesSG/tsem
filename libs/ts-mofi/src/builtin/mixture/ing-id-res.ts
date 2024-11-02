import { ConstructorType } from "../../types/mod.ts";
import { type Builder, Builders, EnumOfADT } from "../enum-struct/mod.ts";
import { MCtxIngId } from "./arch.ts";

export interface IngIdRes {
    Direct: MCtxIngId;
    Shallow: Set<ConstructorType>;
}

@Builders("Direct", "Shallow")
export class IngredientIdRes extends EnumOfADT<IngIdRes> {
    declare static Id: Builder<typeof IngredientIdRes>;
    declare static Referred: Builder<typeof IngredientIdRes>;
}
