// deno-lint-ignore-file no-explicit-any ban-types
export type ConstructorType<I = any, Args extends any[] = any[]> = abstract new(...args: Args) => I;
export type ConsTuple = [ConstructorType, ...ConstructorType[]];
export type InstanceIntersection<T extends ConstructorType[], __O = {}> = T extends
    [infer C1 extends ConstructorType, ...infer CR extends ConstructorType[]]
    ? InstanceIntersection<CR, __O & InstanceType<C1>>
    : __O;

export type Concrete<T extends abstract new(...args: any[]) => any> = T extends
    abstract new(...args: infer Args) => infer I ? new(...args: Args) => I
    : never;

export type ConcreteInstance<T extends abstract new(...args: any[]) => any> = T extends
    abstract new(...args: any[]) => infer I ? I
    : never;

export type StaticMembers<T extends abstract new(...args: any[]) => any> = {
    [K in keyof T]: T[K];
};

export const CONSTRUCTOR_PROTOTYPE: ConstructorType = Object.getPrototypeOf(Function);

export const isConstructorType = (target: unknown): target is ConstructorType<any> => {
    if (typeof target !== "function") return false;
    const pt = Object.getPrototypeOf(target);
    if (pt === CONSTRUCTOR_PROTOTYPE) return true;
    return isConstructorType(pt);
};
