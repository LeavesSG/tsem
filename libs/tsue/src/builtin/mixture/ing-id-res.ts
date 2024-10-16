import { ConstructorType } from "../../types/mod.ts";
import { enumBuilder, EnumStruct } from "../enum-struct/mod.ts";
import { MCtxIngId } from "./arch.ts";

export interface IngIdRes {
    Id: MCtxIngId;
    Referred: ConstructorType;
}

export class IngredientIdRes extends EnumStruct<IngIdRes> {
    static Id = enumBuilder(this, "Id");
    static Referred = enumBuilder(this, "Referred");
}
