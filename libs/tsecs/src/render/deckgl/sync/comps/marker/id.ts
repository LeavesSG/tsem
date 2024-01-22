import { getNode, type SyncFunc } from "../../sync-func.ts";

import type { Id } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncId: SyncFunc<Id> = function (this: BjsSynchronizer, comp, newBuf) {
    const nodes = getNode(this.cmd, comp);
    if (!nodes) return;
    nodes.forEach((node) => node.id = newBuf.id.toString());
};
