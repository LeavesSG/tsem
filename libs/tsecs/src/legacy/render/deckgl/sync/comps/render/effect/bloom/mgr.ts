import { GlowLayer, StandardMaterial } from "@babylonjs/core.ts";

import { Res } from "../../../../../../../../core.ts";
import { BjsResourceBundle } from "../../../../../resources/bundle.ts";

import type { Material, Mesh } from "@babylonjs/core.ts";
import type { EmissiveColor } from "../../../../../../../../preludes/comp.ts";

export class BloomSyncHelper extends Res {
    glowLayer?: GlowLayer;
    excludeList = new WeakSet<Mesh>();
    initBloom() {
        const scene = this.cmd?.getRes(BjsResourceBundle).scene;
        if (!scene) return;
        this.glowLayer = new GlowLayer("glow", scene);
        return this.glowLayer;
    }

    excludeMesh(mesh: Mesh) {
        this.glowLayer?.addExcludedMesh(mesh);
    }

    includeMesh(mesh: Mesh) {
        this.glowLayer?.removeExcludedMesh(mesh);
    }

    static willGlow(buf?: EmissiveColor["buf"]) {
        if (!buf) return false;
        const toString = buf.emissiveColor.toString();
        const isBlack = toString === "0" || toString === "#000000";
        return !isBlack;
    }

    static matWillGlow(mat: Material) {
        if (mat instanceof StandardMaterial) {
            return mat.emissiveColor.asArray().some((c) => c !== 0);
        }
        return false;
    }

    glow(mesh: Mesh): void {
        if (!this.glowLayer) this.initBloom();
        this.includeMesh(mesh);
    }

    extinguish(mesh: Mesh): void {
        if (!mesh.material) return;
        if (BloomSyncHelper.matWillGlow(mesh.material)) this.excludeMesh(mesh);
    }
}
