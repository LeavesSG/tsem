import { Res } from "../../../../../../core.ts";
import { HashedMatPool } from "../../../../resources/mat-pool.ts";

import type { Material, Mesh } from "@babylonjs/core.ts";
import type { Commands } from "../../../../../../core.ts";
import type { HashedMat } from "../../../../../../preludes/comp.ts";
import type { Scalar } from "../../../../../../types/essential.ts";

export class HashedMatSyncHelper extends Res {
    pool: HashedMatPool;
    constructor(cmd: Commands) {
        super(cmd);
        this.pool = cmd.getRes(HashedMatPool);
    }
    updateConfig(sh: Material, cfg?: Scalar) {
        if (!cfg) return;
        Object.entries(cfg).forEach(([key, value]) => {
            if (!(key in sh)) return;
            if (typeof value !== typeof sh[key as keyof typeof sh]) return;
            Object.defineProperty(sh, key, {
                value: value,
            });
        });
    }

    getStrictKey(buf: HashedMat["buf"]) {
        if (!buf.materialCfg || Object.keys(buf.materialCfg).length === 0) return buf.materialKey;
        return `id-${JSON.stringify(buf.materialCfg)}`;
    }
    strictMatching(buf: HashedMat["buf"], mesh: Mesh) {
        const mat = this.pool?.buf.get(this.getStrictKey(buf));
        if (!mat) return false;
        mesh.material = mat;
        return true;
    }
    looseMatching(buf: HashedMat["buf"], mesh: Mesh) {
        const mat = this.pool?.buf.get(buf.materialKey);
        if (!mat) return false;
        const derived = this.deriveMat(buf, mat);
        if (!derived) return false;
        mesh.material = derived;
        this.pool?.buf.set(this.getStrictKey(buf), derived);
        return true;
    }
    deriveMat(buf: HashedMat["buf"], base: Material) {
        const copy = base.clone(this.getStrictKey(buf));
        if (copy) this.updateConfig(copy, buf.materialCfg);
        return copy;
    }
    sync(buf: HashedMat["buf"], sh: Mesh) {
        const matched = this.strictMatching(buf, sh);
        if (matched) return;
        this.looseMatching(buf, sh);
    }
}
