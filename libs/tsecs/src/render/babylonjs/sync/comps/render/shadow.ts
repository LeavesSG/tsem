import { BjsResourceBundle } from "../../../resources/bundle.ts";
import { getMesh, type SyncFunc } from "../../sync-func.ts";

import type { Shadow } from "../../../../../preludes/comp.ts";
import type { BjsSynchronizer } from "../../../resources/sync.ts";

export const syncShadow: SyncFunc<Shadow> = function (
    this: BjsSynchronizer,
    comp,
    newBuf,
) {
    const meshes = getMesh(this.cmd, comp);
    const shadowMap = this.cmd.getRes(BjsResourceBundle).shadowGenerator?.getShadowMap();
    const renderList = shadowMap?.renderList;
    const { castShadow, receiveShadow } = newBuf;
    if (!shadowMap || !renderList) return;
    meshes.forEach((mesh) => {
        mesh.receiveShadows = receiveShadow ?? false;
        if (castShadow) renderList.push(mesh);
        else {
            const find = renderList.findIndex((item) => item === mesh);
            if (!find || find === -1) return true;
            renderList.splice(find, 1);
        }
    });
};
