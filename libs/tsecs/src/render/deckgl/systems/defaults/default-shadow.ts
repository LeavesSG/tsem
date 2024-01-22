import {
    CascadedShadowGenerator,
    DirectionalLight,
    PointLight,
    ShadowGenerator,
} from "@babylonjs/core";

import { BjsResourceBundle } from "../../resources/bundle.ts";

import type { Commands, System } from "../../../../core.ts";

export const defaultShadow: System = function (cmd: Commands) {
    initShadow(cmd);
};

function initShadow(cmd: Commands) {
    const bundle = cmd.getRes(BjsResourceBundle);
    const { light } = bundle;
    if (!light) return;
    let shadowGenerator;
    if (light instanceof DirectionalLight) {
        shadowGenerator = createCsmShadow(light);
    } else if (light instanceof PointLight) {
        shadowGenerator = createShadow(light);
    }
    bundle.shadowGenerator = shadowGenerator;
}

function createShadow(light: DirectionalLight | PointLight) {
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.useContactHardeningShadow = true;
    return shadowGenerator;
}

function createCsmShadow(light: DirectionalLight) {
    const csmShadowGenerator = new CascadedShadowGenerator(1024, light);
    csmShadowGenerator.bias = 0.01;
    csmShadowGenerator.autoCalcDepthBounds = true;
    csmShadowGenerator.darkness = 0.6;
    return csmShadowGenerator;
}
