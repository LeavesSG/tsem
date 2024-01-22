import { Component } from "../../../../core/ecs/component.ts";

export type IBloom = {
    bloom: boolean;
};

export class Bloom extends Component<IBloom> {
    static default = {
        bloom: false,
    };
}
