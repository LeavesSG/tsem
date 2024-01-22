import type { Component } from "../core/ecs/component.ts";

type ConstructorType = abstract new (...args: never[]) => unknown;

export function extendsFrom<const U extends ConstructorType>(
    cons: unknown,
    other: U,
): cons is U {
    let ptr = cons;
    if (cons === other) return true;
    while (ptr) {
        ptr = Object.getPrototypeOf(ptr);
        if (ptr === other) return true;
    }
    return false;
}

function getPrototype(comp: Component): { constructor: typeof Component } {
    return Object.getPrototypeOf(comp) as { constructor: typeof Component };
}

export function getConstructor(comp: Component): typeof Component {
    return getPrototype(comp).constructor;
}
