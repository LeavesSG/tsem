import { Component } from "../../../core.ts";

import type { Scalar } from "../../../types/essential.ts";

export type IHashedTexture = {
    textureKey: string;
    textureCfg?: Scalar;
};

export class HashedTexture extends Component<IHashedTexture> {
    static default: IHashedTexture = {
        textureKey: "",
        textureCfg: {},
    };
}
