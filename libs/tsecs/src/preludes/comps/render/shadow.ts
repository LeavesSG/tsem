import { Component } from "../../../core/ecs/component.ts";

export type IShadow = {
    receiveShadow?: boolean;
    castShadow?: boolean;
};

export class Shadow extends Component<IShadow> {
    static default = {
        receiveShadow: false,
        castShadow: false,
    };
}
