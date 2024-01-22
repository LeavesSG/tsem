import { Component } from "../../../../core/ecs/component.ts";

export type IPosition3 = {
    position: [number, number, number];
};

export class Position3 extends Component<IPosition3> {
    static default: IPosition3 = {
        position: [0, 0, 0],
    };
}
