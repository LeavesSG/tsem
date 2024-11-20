import type { Component } from "../ecs/component.ts";
import type { Res } from "./res.ts";

export class Architecture {
    entityIdMaker = 0;
    components = new Map<number, Component[]>();
    resources = new Map<typeof Res, Res>();

    get newEntityId() {
        return this.entityIdMaker++;
    }
}
