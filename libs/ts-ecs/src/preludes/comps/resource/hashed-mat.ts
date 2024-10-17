import { Component } from "../../../core.ts";

import type { Struct } from "../../../types/essential.ts";

export type IHashedMat = {
    materialKey: string;
    materialCfg?: Struct;
};

export class HashedMat extends Component<IHashedMat> {
    static default: IHashedMat = {
        materialKey: "",
        materialCfg: {},
    };
}
