import { Component } from "../../../core.ts";

import type { Scalar } from "../../../types/essential.ts";

export type IHashedMat = {
    materialKey: string;
    materialCfg?: Scalar;
};

export class HashedMat extends Component<IHashedMat> {
    static default: IHashedMat = {
        materialKey: "",
        materialCfg: {},
    };
}
