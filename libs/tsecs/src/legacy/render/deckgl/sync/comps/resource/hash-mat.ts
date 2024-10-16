import { getMesh, type SyncFunc } from "../../sync-func.ts";

import { HashedMatSyncHelper } from "./hash-mat/mgr.ts";

import type { HashedMat } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncHashedMat: SyncFunc<HashedMat> = function(
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const meshes = getMesh(this.cmd, comp);
    const mgr = this.cmd.getRes(HashedMatSyncHelper);
    meshes.forEach((mesh) => {
        mgr.sync(newBuf, mesh);
    });
};
