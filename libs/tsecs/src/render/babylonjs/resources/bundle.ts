import { Res } from "../../../core.ts";

import type { Camera, Light, Scene, ShadowGenerator } from "@babylonjs/core.ts";

export class BjsResourceBundle extends Res {
    scene?: Scene;
    camera?: Camera;
    light?: Light;
    shadowGenerator?: ShadowGenerator;
}
