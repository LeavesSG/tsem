import { Component } from "../../../../core/ecs/component.ts";

import type { ColorExpr } from "../../../../types/color.ts";

export type IOutline = {
    outline: boolean;
    outlineCfg?: {
        radius?: number;
        strength?: number;
        color?: ColorExpr;
    };
};

export class Outline extends Component<IOutline> {
    static default: IOutline = {
        outline: false,
        outlineCfg: {
            radius: 1,
            strength: 1,
            color: "#ffffff",
        },
    };
}
