import { Color3, PBRMaterial, StandardMaterial } from "@babylonjs/core.ts";

import { getMaterial, type SyncFunc } from "../../../sync-func.ts";

import type { DiffuseColor } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncDiffuseColor: SyncFunc<DiffuseColor> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    materials.forEach((material) => {
        if (!material) return;
        if (material instanceof StandardMaterial) {
            material.diffuseColor = Color3.FromHexString(newBuf.diffuseColor);
        } else if (material instanceof PBRMaterial) {
            material.albedoColor = Color3.FromHexString(newBuf.diffuseColor);
        }
    });
};
