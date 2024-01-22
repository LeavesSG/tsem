import { Material, StandardMaterial } from "@babylonjs/core.ts";

import { getMesh, type SyncFunc } from "../../sync-func.ts";

import type { Transparency } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncTransparency: SyncFunc<Transparency> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const meshes = getMesh(this.cmd, comp);
    const { transparent, opacity } = newBuf;
    meshes.forEach((mesh) => {
        mesh.visibility = opacity ?? 1;
        const material = mesh.material;
        if (!material) return false;
        if (transparent) {
            material.transparencyMode = Material.MATERIAL_ALPHABLEND;
            tryGetAlphaFromDiffuseText(material);
        } else {
            material.transparencyMode = Material.MATERIAL_OPAQUE;
        }
    });
};

function tryGetAlphaFromDiffuseText(mat: Material) {
    if (!(mat instanceof StandardMaterial)) return;
    if (mat.opacityTexture) return;
    if (!mat.diffuseTexture) return;
    mat.diffuseTexture.hasAlpha = true;
    mat.useAlphaFromDiffuseTexture = true;
}
