import { Component } from "../../../core/ecs/component.ts";

export type IName = {
    name: string;
};

export class Name extends Component<IName> {
    static default = {
        name: "",
    };
}
