import { PBRMaterial, StandardMaterial } from "@babylonjs/core.ts";

import { getHashedText, getMaterial, type SyncFunc } from "../../../sync-func.ts";

import type { OpacityTexture } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncOpacityTexture: SyncFunc<OpacityTexture> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    const texture = getHashedText(this.cmd, newBuf.opacityTexture.toString()) ?? null;
    materials.forEach((material) => {
        if (material instanceof StandardMaterial) {
            material.opacityTexture = texture;
        } else if (material instanceof PBRMaterial) {
            material.opacityTexture = texture;
        }
    });
};
