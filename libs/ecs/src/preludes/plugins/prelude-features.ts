import { App, Plugin } from "../../core.ts";
import { defaultComponents } from "../sys/default-comps.ts";
import { RenderLoop } from "./render-loop.ts";

export class PreludeFeatures extends Plugin {
    build(app: App): void {
        app.addPlugin(RenderLoop);
        app.addStartupSystem(defaultComponents);
    }
}
