import { Component } from "../../../core/ecs/component.ts";

import type { Index } from "../../../types/essential.ts";

export type IId = {
    id: Index | bigint;
};

export class Id extends Component<IId> {
    static default = {
        id: "",
    };
}
