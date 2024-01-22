import { Component } from "../../../core/ecs/component.ts";

export type ITransparency = {
    transparent: boolean;
    opacity?: number;
};

export class Transparency extends Component<ITransparency> {
    static default = {
        transparent: false,
        opacity: 1,
    };
}
