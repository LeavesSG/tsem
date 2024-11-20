import { type Builder, Builders, EnumOfADT } from "../adt/mod.ts";
import type { ConstructorType } from "../vanilla/mod.ts";
import type { MCtxIngId } from "./arch.ts";

export interface IngIdRes {
    Direct: MCtxIngId;
    Shallow: Set<ConstructorType>;
}

@Builders("Direct", "Shallow")
export class IngredientIdRes extends EnumOfADT<IngIdRes> {
    declare static Id: Builder<typeof IngredientIdRes>;
    declare static Referred: Builder<typeof IngredientIdRes>;
}
