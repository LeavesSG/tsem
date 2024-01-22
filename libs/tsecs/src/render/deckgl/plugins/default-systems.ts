import { Plugin } from "../../../core.ts";
import { defaultStartup } from "../systems.ts";

import type { App } from "../../../core.ts";

export class DefaultSystems extends Plugin {
    build(app: App) {
        return app.addStartupSystem(defaultStartup);
    }
}
