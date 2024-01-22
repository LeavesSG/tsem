import { DirectionalLight, HemisphericLight, Vector3 } from "@babylonjs/core.ts";

import { Name, Position3, Target3 } from "../../../../preludes/comp.ts";
import { BjsResourceBundle } from "../../resources/bundle.ts";

import type { Commands, System } from "../../../../core.ts";

export const defaultLight: System = function (cmd: Commands) {
    initDirectionalLight(cmd);
    initHemisphereLight(cmd);
};

function initDirectionalLight(cmd: Commands) {
    const lightName = "defaultLight";

    const bundle = cmd.getRes(BjsResourceBundle);
    if (bundle.light) return;
    const scene = bundle.scene;
    if (!scene) return;
    const light = new DirectionalLight(
        lightName,
        Vector3.FromArray([0, 0, 0]),
        scene,
    );
    bundle.light = light;
    cmd.spawn(
        new Name({ name: lightName }),
        new Position3({ position: [-500, 1000, -500] }),
        new Target3({ target: [0, 0, 0] }),
    );
    return light;
}

function initHemisphereLight(cmd: Commands) {
    const lightName = "defaultHemisphereLight";

    const bundle = cmd.getRes(BjsResourceBundle);
    const scene = bundle.scene;
    if (!scene) return;
    const light = new HemisphericLight(
        lightName,
        Vector3.FromArray([0, -1, 0]),
        scene,
    );
    cmd.spawn(
        new Name({ name: lightName }),
        new Position3({ position: [-500, 1000, -500] }),
        new Target3({ target: [0, 0, 0] }),
    );
    return light;
}
