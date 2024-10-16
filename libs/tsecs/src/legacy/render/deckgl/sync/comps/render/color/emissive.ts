import { Color3, PBRMaterial, StandardMaterial } from "@babylonjs/core.ts";

import { getMaterial, type SyncFunc } from "../../../sync-func.ts";

import type { EmissiveColor } from "../../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncEmissiveColor: SyncFunc<EmissiveColor> = function(
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    materials.forEach((material) => {
        if (!material) return;
        if (material instanceof StandardMaterial) {
            material.emissiveColor = Color3.FromHexString(newBuf.emissiveColor);
        } else if (material instanceof PBRMaterial) {
            material.emissiveColor = Color3.FromHexString(newBuf.emissiveColor);
        }
    });
};
