import { TextureType } from "../../../../types/text.ts";

import { TextureBase } from "./base.ts";

import type { Index } from "../../../../types/essential.ts";

export type IDiffuseTexture = {
    [TextureType.Diffuse]: Index;
};

export class DiffuseTexture extends TextureBase<IDiffuseTexture> {
    static default = {
        [TextureType.Diffuse]: "",
    };
}
