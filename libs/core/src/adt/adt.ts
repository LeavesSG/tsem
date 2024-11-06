/**
 * This module contains a class style implementation for `Enum of ADT` proposal.
 * @module
 */

import { SYMBOL_PHANTOM } from "../shared/mod.ts";

/**
 * Use generic classes to implement Enum of ADT proposal.
 * There are some gaps between generic classes and ADT, use `asADT` method in
 * {@link EnumOfADT} to distribute into ADT type for better TypeScript inference.
 *
 * @example
 * ```ts
 * interface ContactDef {
 *    Email: string;
 *    Mobile: number;
 * }
 * class Contact<V extends keyof ContactDef> extends EnumOfADT<ContactDef, V> {}
 * const phoneNum = new Contact("Mobile", 12345678);
 * const emailAddr = new Contact("Email", "xxx@xx.xx");
 * ```
 */
export class EnumOfADT<
    Def = Record<string, unknown>,
    Var extends keyof Def & string = keyof Def & string,
> {
    declare [SYMBOL_PHANTOM]: Def;

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
     * Distribute to ADT types.
     *
     * @example
     * ```ts
     * interface ContactDef {
     *    Email: string;
     *    Mobile: number;
     * }
     * class Contact<V extends keyof ContactDef = keyof ContactDef>
     *    extends EnumOfADT<ContactDef, V> {}
     * const email = new Contact("Email", "xxx@xxx.xx") as Contact;
     * if (email.variant === "Email") email.value.split(" "); // Property 'split' does not exist on type 'string | number'.;
     *
     * const adt = email.asADT();
     * if (adt.variant === "Email") adt.value.split(" "); // Ok.
     * ```
     */
    asADT(): Var extends keyof Def ? { variant: Var; value: Def[Var] } : never {
        return { variant: this.variant, value: this.value } as any;
    }
}

/**
 * A decorator to create builder for {@link EnumOfADT} constructors.
 * Builders will be applied as properties to constructor with `variant` string as their propKey.
 */
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

/** Annotate the default builder type for a variant. */
export type Builder<T extends typeof EnumOfADT<any, any>> = (
    value: InstanceType<T>["value"],
) => InstanceType<T>;
