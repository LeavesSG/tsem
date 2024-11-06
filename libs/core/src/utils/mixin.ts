import type { ConstructorType, InstanceIntersection } from "../vanilla/ctor.ts";

/**
 * derived from TypeScript Handbook
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
 */
export function applyMixins<
    T extends ConstructorType[],
    U extends ConstructorType = ConstructorType,
>(
    derivedCtor: U,
    constructors: T,
): ConstructorType<InstanceIntersection<T> & InstanceType<U>> {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null),
            );
        });
    });
    return derivedCtor as ConstructorType<
        InstanceIntersection<T> & InstanceType<U>
    >;
}
