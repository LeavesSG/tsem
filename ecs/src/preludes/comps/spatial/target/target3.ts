import { Component } from "../../../../core/ecs/component.ts";

export type ITarget3 = {
    target: [number, number, number];
};

export class Target3 extends Component<ITarget3> {
    static default: ITarget3 = {
        target: [0, 0, 0],
    };
}
