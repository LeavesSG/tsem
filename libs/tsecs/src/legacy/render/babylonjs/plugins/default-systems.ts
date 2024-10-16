import { Plugin } from "../../../../core.ts";
import { defaultComponents } from "../../../../preludes.ts";
import { defaultCamera, defaultLight, defaultScene, defaultShadow } from "../systems/defaults.ts";
import { syncComponents } from "../systems/sync-comps.ts";

import type { App } from "../../../../core.ts";

export class DefaultSystems extends Plugin {
    build(app: App) {
        return app
            .addStartupSystem(defaultScene)
            .addStartupSystem(defaultCamera)
            .addStartupSystem(defaultLight)
            .addStartupSystem(defaultShadow)
            .addStartupSystem(defaultComponents)
            .addStartupSystem(syncComponents);
    }
}
