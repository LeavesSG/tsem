import { ColorType, type ColorExpr } from "../../../../types/color.ts";

import { ColorBase } from "./base.ts";

export type IEmissiveColor = {
    [ColorType.Emissive]: ColorExpr;
};

export class EmissiveColor extends ColorBase<IEmissiveColor> {
    static default: IEmissiveColor = {
        [ColorType.Emissive]: "#ffffff",
    };
}
