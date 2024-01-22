import { TextureType } from "../../../../types/text.ts";

import { TextureBase } from "./base.ts";

import type { Index } from "../../../../types/essential.ts";

export type IOpacityTexture = {
    [TextureType.Opacity]: Index;
};

export class OpacityTexture extends TextureBase<IOpacityTexture> {
    static default = {
        [TextureType.Opacity]: "",
    };
}
