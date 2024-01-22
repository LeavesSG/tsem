import { ArcRotateCamera, DirectionalLight, HemisphericLight, Vector3 } from "@babylonjs/core.ts";

import { getNode, type SyncFunc } from "../../sync-func.ts";

import type { Target3 } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncTarget3: SyncFunc<Target3> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const nodes = getNode(this.cmd, comp);
    nodes.forEach((node) => {
        if (node instanceof DirectionalLight || node instanceof HemisphericLight) {
            node.setDirectionToTarget(Vector3.FromArray(newBuf.target));
        } else if (node instanceof ArcRotateCamera) {
            node.setTarget(Vector3.FromArray(newBuf.target));
        }
    });
};
