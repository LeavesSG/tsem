import { getConstructor } from "../../helpers/hierarchy.ts";

import type { Component } from "../../core.ts";
import type {
    DefaultCompNames,
    DefaultComponentDescriptor,
    DefaultComponentPlainProps,
} from "../../types/default-comp";
import type { Scalar } from "../../types/essential.ts";

type CustomComponentDescriptor<T extends string> = {
    name: T;
    args: T extends DefaultCompNames ? never : unknown[];
};

export type ComponentDescriptor<T extends string = DefaultCompNames> = T extends DefaultCompNames
    ? DefaultComponentDescriptor<T>
    : CustomComponentDescriptor<T>;

export interface StylingBlock {
    selector: string | RegExp;
    descriptors?: ComponentDescriptor<string>[];
    bundleKey?: string;
    plainProps?: DefaultComponentPlainProps;
    components?: Component<Scalar>[];
}

export type StylingSheet = StylingBlock[];

export function defineCompDesc<
    const T extends string = DefaultCompNames,
>(
    styler: { name: T; args: ComponentDescriptor<T>["args"] },
) {
    return styler;
}

export function CompToDesc(component: Component<Scalar>): ComponentDescriptor<string> {
    const name = getConstructor(component).name;
    const args = [component.buf];
    return {
        name,
        args,
    };
}
