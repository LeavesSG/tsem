import { PHANTOM_MARKER } from "../../types/phantom.ts";
import type { Pattern } from "../pattern/pattern.ts";
import { SYMBOL_TO_PATTERN } from "../pattern/to-pattern.ts";

/**
 * Use generic classes to implement Enum of ADT feature.
 * There is some gap between generic classes and ADT, use `"distribute"` method in
 * {@link EnumOfADT} to distribute into ADT type for better TypeScript inference.
 */
export class EnumOfADT<
    Def = Record<string, unknown>,
    Var extends keyof Def & string = keyof Def & string,
> {
    /**
     * Variant
     */
    variant: Var;
    /**
     * Associated value.
     */
    value: Def[Var];
    declare [PHANTOM_MARKER]: Def;

    constructor(variant: Var, value: Def[Var]) {
        this.variant = variant;
        this.value = value;
    }

    /**
     * Predicate that indicates `this` is of given variant.
     */
    isVariant<const V2 extends keyof Def & string>(variant: V2): this is this & EnumOfADT<Def, V2> {
        return this.variant as unknown as V2 === variant;
    }

    /**
     * Distribute generic class to ADT types.
     */
    distribute() {
        return { variant: this.variant, value: this.value } as Var extends keyof Def ? { variant: Var; value: Def[Var] }
            : never;
    }

    /**
     * Builders
     */
    static new<Def, Var extends keyof Def & string>(variant: Var, value: Def[Var]) {
        return new this(variant, value);
    }

    /**
     * Implementation of `ToPattern` trait. This impl should be dynamic to avoid circulate import references.
     */
    declare [SYMBOL_TO_PATTERN]: Pattern<EnumOfADT<Def, Var>>;
}

export function Builders<Def>(...variants: (keyof Def & string)[]) {
    return (
        target: typeof EnumOfADT<Def, keyof Def & string>,
    ) => {
        Object.defineProperties(
            target,
            Object.fromEntries(variants.map(v => [v, {
                value: (value: Def[keyof Def & string]) => new target(v, value),
            }])),
        );
    };
}

export type Builder<T extends typeof EnumOfADT<any, any>> = (
    value: InstanceType<T>["value"],
) => InstanceType<T>;
