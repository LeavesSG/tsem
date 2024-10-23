import * as components from "../comp.ts";
import { ComponentPool } from "../res/comp-pool.ts";

import type { System } from "../../core/ecs/system.ts";

export const defaultComponents: System = function defaultComponents(cmd) {
    const entries = Object.entries(components);
    const pool = new ComponentPool(cmd, entries);
    cmd.register(ComponentPool, pool);
};
