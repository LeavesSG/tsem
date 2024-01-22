import { PBRMaterial, StandardMaterial } from "@babylonjs/core.ts";

import { getHashedText, getMaterial, type SyncFunc } from "../../../sync-func.ts";

import type { DiffuseTexture } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncDiffuseTexture: SyncFunc<DiffuseTexture> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    const texture = getHashedText(this.cmd, newBuf.diffuseTexture.toString());
    materials.forEach((material) => {
        if (!texture) return;
        if (material instanceof StandardMaterial) {
            material.diffuseTexture = texture;
        } else if (material instanceof PBRMaterial) {
            material.albedoTexture = texture;
        }
    });
};
