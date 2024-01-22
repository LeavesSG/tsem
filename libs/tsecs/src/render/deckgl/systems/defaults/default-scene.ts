import { Color4, Engine, Scene } from "@babylonjs/core.ts";

import { AppContainer } from "../../../../preludes.ts";
import { BjsResourceBundle } from "../../resources/bundle.ts";

import type { Commands } from "../../../../core.ts";
import type { System } from "../../../../core/ecs/system.ts";

export const defaultScene: System = function (cmd: Commands) {
    initScene(cmd);
};

function initScene(cmd: Commands) {
    const dom = cmd.getRes(AppContainer).buf ?? document.querySelector<HTMLElement>("#app") ??
        document.body;
    const canvas = dom as HTMLCanvasElement;

    const engine = new Engine(canvas, true, {
        alpha: true,
    });

    dom.addEventListener("resize", () => engine.resize());

    const bundle = cmd.getRes(BjsResourceBundle);
    if (bundle.scene) return bundle.scene;
    bundle.scene ??= new Scene(engine);
    const scene = bundle.scene;
    scene.clearColor = new Color4(0, 0, 0, 0);

    engine.runRenderLoop(() => {
        scene.render();
    });
}
