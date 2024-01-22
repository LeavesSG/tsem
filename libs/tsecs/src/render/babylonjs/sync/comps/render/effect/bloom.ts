import { getMesh, type SyncFunc } from "../../../sync-func.ts";

import { BloomSyncHelper } from "./bloom/mgr.ts";

import type { Bloom } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../../resources/sync.ts";

export const syncBloom: SyncFunc<Bloom> = function (this: BjsSynchronizer, comp, newBuf) {
    const meshes = getMesh(this.cmd, comp);
    const mgr = this.cmd.getRes(BloomSyncHelper);
    meshes.forEach((mesh) => {
        switch (newBuf.bloom) {
            case true:
                mgr.glow(mesh);
                break;
            case false:
                mgr.extinguish(mesh);
                break;
        }
    });
};
