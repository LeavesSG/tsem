import { SideType } from "../../../../../types/side.ts";
import { getMaterial, type SyncFunc } from "../../sync-func.ts";

import type { Side } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncSide: SyncFunc<Side> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const materials = getMaterial(this.cmd, comp);
    const backFaceCulling = newBuf.side === SideType.Front;
    materials.forEach((material) => {
        if (material) material.backFaceCulling = backFaceCulling;
    });
    return true;
};
