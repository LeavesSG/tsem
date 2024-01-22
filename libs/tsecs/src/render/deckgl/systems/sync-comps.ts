import { BjsSynchronizer } from "../resources/sync.ts";

import type { Commands, System } from "../../../core.ts";

export const syncComponents: System = function (cmd: Commands) {
    cmd.register(BjsSynchronizer);
};
