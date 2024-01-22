import type { Commands } from "../ess/cmd.ts";

type SystemArguments = [
    cmd: Commands,
];

/**
 * # System
 *
 * `System` in ECS is just a normal function. It requires the `Commands` as it only
 * parameter and within it to accomplish various tasks in different `Stage`.
 *
 * ## Usage
 *
 * You can define a system just like normal javascript/typescript functions. You can
 * also acquire completion and type inferring by explicitly annotate the function as
 * `System`.
 *
 * ```typescript
 * const defaultSystems: System = (cmd: Commands) => {
 *     cmd.spawn();
 * };
 * ```
 *
 * Each `System` added to `App` will be bound to a `Stage`. And will be invoked once
 * the `App` move the certain `Stage`.
 */
export type System = (...args: SystemArguments) => void | Promise<void>;

export const System = Function;
