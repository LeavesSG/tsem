import { Component } from "../../../core.ts";

import type { Struct } from "../../../types/essential.ts";

export type IHashedTexture = {
    textureKey: string;
    textureCfg?: Struct;
};

export class HashedTexture extends Component<IHashedTexture> {
    static default: IHashedTexture = {
        textureKey: "",
        textureCfg: {},
    };
}
