import { getNode, type SyncFunc } from "../../sync-func.ts";

import type { Name } from "../../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncName: SyncFunc<Name> = function(this: BjsSynchronizer, comp, newBuf) {
    const nodes = getNode(this.cmd, comp);
    if (!nodes) return;
    nodes.forEach((node) => node.name = newBuf.name);
};
