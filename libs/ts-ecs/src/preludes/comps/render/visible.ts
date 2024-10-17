import { Component } from "../../../core/ecs/component.ts";

export type IVisibility = {
    visible: boolean;
};

export class Visibility extends Component<IVisibility> {
    static default = {
        visible: true,
    };
}
