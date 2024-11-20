import type { ConstructorType } from "../vanilla/mod.ts";

/**
 * Create a default instance, only could implemented on constructor.
 */
export abstract class Default {
    abstract default(): InstanceType<this & ConstructorType>;
}
