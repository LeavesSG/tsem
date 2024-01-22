import type { Component } from "../core.ts";
import type * as Components from "../preludes/comp.ts";
import type { Scalar } from "./essential.ts";

export type DefaultComponents = typeof Components;
export type DefaultCompNames = keyof DefaultComponents;
export type DefaultCompArgs<N extends DefaultCompNames> = DefaultComponents[N] extends
    typeof Component<Scalar> ? ConstructorParameters<DefaultComponents[N]> : unknown;

type UnionToIntersection<T> = (T extends any ? (x: T) => void : never) extends (
    x: infer R,
) => void ? R
    : never;
type DefaultCompBufUnion = {
    [key in keyof DefaultComponents]: InstanceType<DefaultComponents[key]> extends
        Component<infer R> ? R : never;
};

type DefaultCompBufIntersection = UnionToIntersection<
    DefaultCompBufUnion[keyof DefaultCompBufUnion]
>;
export type DefaultComponentPlainProps = Partial<
    {
        [key in keyof DefaultCompBufIntersection]: DefaultCompBufIntersection[key];
    }
>;

export type DefaultComponentDescriptor<T extends DefaultCompNames> = {
    name: T;
    args: DefaultCompArgs<T>;
};
