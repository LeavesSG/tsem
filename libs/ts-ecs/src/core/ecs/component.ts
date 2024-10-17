// deno-lint-ignore-file no-explicit-any
import type { Struct } from "../../types/essential.ts";

/**
 * # Component
 *
 * `Component` is the most core section of ECS. It store the data of different
 * dimensions that master the appearances and behaviors of an `Entity`.
 *
 * ## Caution
 * `Component` should only store pure data. Which means the data should not contain
 * any references, complex data structures etc..
 *
 * ## Usage
 * ```typescript
 *  // Components can be bound to entity while spawning.
 *  const [comps, entity] = cmd.spawn(
 *      new Name({ name: "Tom" }),
 *      new Position3({ position: [0, 0, 0] }),
 *  );
 *  // Component can also be bound to an entity later after spawn.
 *  const [newComps, sameEntity] = cmd.describe([
 *      new Rotation3({ rotation: [1, 0, 0] }),
 *  ], entity);
 * ```
 */

export abstract class Component<const T extends Struct = any> {
    buf: T;
    constructor(buf: T) {
        this.buf = buf;
    }
}
