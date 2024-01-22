import { ArcRotateCamera, Vector3 } from "@babylonjs/core.ts";

import { BjsResourceBundle } from "../../resources/bundle.ts";

import type { Commands, System } from "../../../../core.ts";

export const defaultCamera: System = function (cmd: Commands) {
    initCamera(cmd);
};

function initCamera(cmd: Commands) {
    const bundle = cmd.getRes(BjsResourceBundle);
    if (bundle.camera) return;

    const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        2000,
        Vector3.FromArray([0, 0, 0]),
        bundle.scene,
    );
    bundle.camera = camera;

    camera.minZ = 10;
    camera.maxZ = 2500;
    camera.attachControl(true, true);

    if (bundle.scene) {
        bundle.scene.activeCamera = camera;
    }
    return camera;
}
