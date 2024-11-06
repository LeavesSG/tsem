import { PHANTOM_MARKER } from "../shared/mod.ts";

/**
 * Use generic classes to implement Enum of ADT feature.
 * There is some gap between generic classes and ADT, use `"distribute"` method in
 * {@link EnumOfADT} to distribute into ADT type for better TypeScript inference.
 */
export class EnumOfADT<
    Def = Record<string, unknown>,
    Var extends keyof Def & string = keyof Def & string,
> {
    declare [PHANTOM_MARKER]: Def;

    /**
     * Variant
     */
    variant: Var;
    /**
     * Associated value.
     */
    value: Def[Var];

    constructor(variant: Var, value: Def[Var]) {
        this.variant = variant;
        this.value = value;
    }

    /**
     * Predicate that indicates `this` is of given variant.
     */
    isVariant<const V2 extends keyof Def & string>(
        variant: V2,
    ): this is this & EnumOfADT<Def, V2> {
        return this.variant as unknown as V2 === variant;
    }

    /**
     * Distribute generic class to ADT types.
     */
    asADT(): Var extends keyof Def ? { variant: Var; value: Def[Var] } : never {
        return { variant: this.variant, value: this.value } as any;
    }

    /**
     * Builders
     */
    static inst<Def, Var extends keyof Def & string>(
        variant: Var,
        value: Def[Var],
    ): EnumOfADT<Def, Var> {
        return new this(variant, value);
    }
}

export function Builders<Def>(
    ...variants: (keyof Def & string)[]
): (target: typeof EnumOfADT<Def, keyof Def & string>) => void {
    return (
        target: typeof EnumOfADT<Def, keyof Def & string>,
    ) => {
        Object.defineProperties(
            target,
            Object.fromEntries(variants.map((v) => [v, {
                value: (value: Def[keyof Def & string]) => new target(v, value),
            }])),
        );
    };
}

export type Builder<T extends typeof EnumOfADT<any, any>> = (
    value: InstanceType<T>["value"],
) => InstanceType<T>;
