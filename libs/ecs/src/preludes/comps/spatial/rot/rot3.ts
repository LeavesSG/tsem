import { Component } from "../../../../core/ecs/component.ts";

export type IRotation3 = {
    rotation: [number, number, number];
};

export class Rotation3 extends Component<IRotation3> {
    static default: IRotation3 = {
        rotation: [0, 0, 0],
    };
}
