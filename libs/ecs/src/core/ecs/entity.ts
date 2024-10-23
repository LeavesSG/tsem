/**
 * # Entity
 *
 * `Entity` in ECS is a unique number. We extends `Entity` class from
 * the `Number` decoration class. This is basically the same with using number
 * type directly. However a class definition may be beneficial to inheritance
 * detection. This slight difference can be ignored since you will not interact
 * with the Entity directly in most circumstances.
 *
 * ## Usage
 * Avoid instantiate the entity directly, using `Command.spawn` recommended.
 *
 * ```typescript
 * (cmd: Commands) => {
 *  const [comps , entity] = cmd.spawn();
 * }
 * ```
 *
 * In most cases, `Entity` is not the kind of thing you need to concern, the `Components`
 * that bound to it, instead, are.
 */

export class Entity extends Number {}
