import { Component } from "../../../core/ecs/component.ts";

export type ICompBundle = {
    bundleKey: string;
};

export class CompBundle extends Component<ICompBundle> {
    static default: ICompBundle = {
        bundleKey: "",
    };
}
