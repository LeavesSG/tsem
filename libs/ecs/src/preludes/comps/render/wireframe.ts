import { Component } from "../../../core/ecs/component.ts";

export type IWireframe = {
    wireframe: boolean;
};

export class Wireframe extends Component<IWireframe> {
    static default = {
        wireframe: false,
    };
}
