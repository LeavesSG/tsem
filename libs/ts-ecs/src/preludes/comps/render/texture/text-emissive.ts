import { TextureType } from "../../../../types/text.ts";

import { TextureBase } from "./base.ts";

import type { Index } from "../../../../types/essential.ts";

export type IEmissiveTexture = {
    [TextureType.Emissive]: Index;
};

export class EmissiveTexture extends TextureBase<IEmissiveTexture> {
    static default = {
        [TextureType.Emissive]: "",
    };
}
