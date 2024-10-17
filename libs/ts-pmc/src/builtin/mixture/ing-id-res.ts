import { ConstructorType } from "../../types/mod.ts";
import { builder, EnumStruct } from "../enum-struct/mod.ts";
import { MCtxIngId } from "./arch.ts";

export interface IngIdRes {
    Id: MCtxIngId;
    Referred: ConstructorType;
}

export class IngredientIdRes extends EnumStruct<IngIdRes> {
    static Id = builder(this, "Id");
    static Referred = builder(this, "Referred");
}
