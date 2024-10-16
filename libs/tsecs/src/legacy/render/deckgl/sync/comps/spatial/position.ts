import { getMesh, type SyncFunc } from "../../sync-func.ts";

import type { Position3 } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncPosition3: SyncFunc<Position3> = function(
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const meshes = getMesh(this.cmd, comp);
    meshes.forEach((mesh) => {
        if (!("position" in mesh)) return false;
        mesh.position.set(...newBuf.position);
    });
};
