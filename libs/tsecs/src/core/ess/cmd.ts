import { getConstructor } from "../../helpers/hierarchy.ts";
import { Entity } from "../ecs/entity.ts";

import { CommandStage } from "./hooks/stage.ts";
import { QueryManager } from "./query/cache.ts";
import { QueryRes } from "./query/variants/res.ts";

import type { Concrete } from "../../types/essential.ts";
import type { Component } from "../ecs/component.ts";
import type { Architecture } from "./arch.ts";
import type { Query } from "./query/base.ts";
import type { Res } from "./res.ts";
import type { Schedule } from "./schedule.ts";

export class Commands {
    /** Architecture, with all ecs data stored. */
    arch: Architecture;
    /** Schedule, control the life stages of the app. */
    schedule: Schedule;
    /** QueryManager, handle the queries to get the resources and ecs iterables. */
    queryMgr = new QueryManager();

    constructor(arch: Architecture, schedule: Schedule) {
        this.arch = arch;
        this.schedule = schedule;
    }

    private createEntity() {
        const id = this.arch.newEntityId;
        const entity = new Entity(id);
        this.schedule.trigger(CommandStage.Spawn);
        return entity;
    }

    describe(comps: Component[], entity: Entity) {
        const found = this.arch.components.get(+entity) ?? [];
        found.push(...comps);
        this.arch.components.set(+entity, found);
        comps.forEach((comp) => this.queryMgr.validateCache(getConstructor(comp)));
        this.schedule.trigger(CommandStage.Describe);
        return [comps, entity] as [Component[], Entity];
    }

    spawn(...comps: Component[]) {
        const entity = this.createEntity();
        return this.describe(comps, entity);
    }

    drop(entity: Entity) {
        const id = +entity;
        this.arch.components.delete(id);
        this.schedule.trigger(CommandStage.Drop);
    }

    register<T extends Concrete<typeof Res>>(ResCon: T, res = new ResCon(this)) {
        this.arch.resources.set(ResCon, res);
        this.schedule.trigger(CommandStage.Register);
        return [ResCon, res as InstanceType<T>] as const;
    }

    updateComp<T extends Component>(comp: T, newBuf: T["buf"]) {
        comp.buf = newBuf;
        this.schedule.trigger(CommandStage.UpdateComp);
    }

    query<const T extends Query>(query: T) {
        const res = this.queryMgr.query(query, this.arch);
        this.schedule.trigger(CommandStage.Query);
        return res;
    }

    getRes<T extends Concrete<typeof Res>>(Res: T) {
        return this.query(new QueryRes(Res)) ?? this.register(Res)[1];
    }
}
