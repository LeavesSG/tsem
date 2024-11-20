import { Color4 } from "@babylonjs/core.ts";

import { getMesh, type SyncFunc } from "../../../sync-func.ts";

import type { Outline } from "../../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncOutline: SyncFunc<Outline> = function(this: BjsSynchronizer, comp, newBuf) {
    const meshes = getMesh(this.cmd, comp);
    meshes.forEach((mesh) => {
        switch (newBuf.outline) {
            case true:
                mesh.enableEdgesRendering();
                break;
            case false:
                mesh.disableEdgesRendering();
                break;
        }
        if (!newBuf.outlineCfg) return;
        const { color, radius } = newBuf.outlineCfg;
        if (color) mesh.edgesColor = Color4.FromHexString(color);
        if (radius) mesh.edgesWidth = radius;
    });
};
