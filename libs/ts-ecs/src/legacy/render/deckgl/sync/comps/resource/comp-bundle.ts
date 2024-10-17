import { Res } from "../../../../../../core.ts";
import { ComponentBundlePool } from "../../../../../../preludes/res/comp-bundle-pool.ts";
import { BjsBindingPool } from "../../../resources/binding-pool.ts";
import { getNode, type SyncFunc } from "../../sync-func.ts";

import { Node } from "@babylonjs/core.ts";
import type { CompBundle } from "../../../../../../preludes/comps/resource/comp-bundle.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

class CompBundleHelper extends Res {
    __pool?: ComponentBundlePool;
    __binding?: BjsBindingPool;
    get pool() {
        if (this.__pool) return this.__pool;
        this.__pool = this.cmd.getRes(ComponentBundlePool);
        return this.__pool;
    }

    get binding() {
        if (this.__binding) return this.__binding;
        this.__binding = this.cmd.getRes(BjsBindingPool);
        return this.__binding;
    }

    sync(newBuf: CompBundle["buf"], node: Node) {
        const comps = this.pool.buf.get(newBuf.bundleKey);
        if (!comps) return;
        comps.forEach((comp) => this.binding.bind(comp, node));
    }
}

export const syncCompBundle: SyncFunc<CompBundle> = function(this: BjsSynchronizer, comp, newBuf) {
    const cmd = this.cmd;
    const nodes = getNode(cmd, comp);
    if (!nodes) return;
    const helper = cmd.getRes(CompBundleHelper);
    nodes.forEach((node) => helper.sync(newBuf, node));
};
