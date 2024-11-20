import { Component } from "../../../core/ecs/component.ts";
import { SideType } from "../../../types/side.ts";

export type ISide = {
    side: SideType;
};

export class Side extends Component<ISide> {
    static default = {
        side: SideType.Front,
    };
}
