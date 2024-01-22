import { PBRMaterial, StandardMaterial } from "@babylonjs/core.ts";

import { getHashedText, getMaterial, type SyncFunc } from "../../../sync-func.ts";

import type { EmissiveTexture } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncEmissiveTexture: SyncFunc<EmissiveTexture> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    const texture = getHashedText(this.cmd, newBuf.emissiveTexture.toString());
    materials.forEach((material) => {
        if (!texture) return;
        if (material instanceof StandardMaterial || material instanceof PBRMaterial) {
            material.emissiveTexture = texture;
        }
    });
};
