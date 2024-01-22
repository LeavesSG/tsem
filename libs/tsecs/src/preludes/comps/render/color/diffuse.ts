import { ColorType, type ColorExpr } from "../../../../types/color.ts";

import { ColorBase } from "./base.ts";

export type IDiffuseColor = {
    [ColorType.Diffuse]: ColorExpr;
};

export class DiffuseColor extends ColorBase<IDiffuseColor> {
    static default: IDiffuseColor = {
        [ColorType.Diffuse]: "#ffffff",
    };
}
