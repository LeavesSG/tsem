import { getMaterial, type SyncFunc } from "../../sync-func.ts";

import type { Wireframe } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncWireframe: SyncFunc<Wireframe> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    materials.forEach((material) => {
        if (material) material.wireframe = newBuf.wireframe;
    });
};
