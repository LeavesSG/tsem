import { getMesh, type SyncFunc } from "../../sync-func.ts";

import type { Visibility } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncVisibility: SyncFunc<Visibility> = function(
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const meshes = getMesh(this.cmd, comp);
    meshes.forEach((mesh) => mesh.setEnabled(newBuf.visible));
};
