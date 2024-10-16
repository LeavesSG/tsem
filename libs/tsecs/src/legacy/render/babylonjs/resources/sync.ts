import { type Commands, type Component, type Entity, QueryEC, Res } from "../../../../core.ts";
import { getConstructor } from "../../../../helpers/hierarchy.ts";
import { ComponentPool, Pool } from "../../../../preludes.ts";
import { Name } from "../../../../preludes/comp.ts";
import * as componentSyncFuncs from "../sync/sync-comps.ts";

import { BjsBindingPool } from "./binding-pool.ts";
import { BjsResourceBundle } from "./bundle.ts";

import type { Scene } from "@babylonjs/core.ts";
import type { Struct } from "../../../../types/essential.ts";
import type { SyncFunc } from "../sync/sync-func.ts";

export class BjsSynchronizer extends Res {
    cmd: Commands;
    syncMap: Pool<typeof Component<Struct>, SyncFunc>;
    reflection: Pick<Commands, "updateComp" | "describe">;

    constructor(cmd: Commands) {
        super(cmd);
        this.cmd = cmd;

        this.reflection = {
            updateComp: this.cmd.updateComp.bind(this.cmd),
            describe: this.cmd.describe.bind(this.cmd),
        };
        this.injectCmdHooks();

        this.syncMap = new Pool<typeof Component<Struct>, SyncFunc>(cmd);
        const pool = cmd.getRes(ComponentPool);
        const entries = this.transformEntries(componentSyncFuncs, pool);
        this.addSyncMap(entries);
    }

    private updateComp<T extends Component>(comp: T, newBuf: T["buf"]) {
        this.reflection.updateComp(comp, newBuf);
        this.syncComp(comp, newBuf);
    }

    private describe(comps: Component[], entity: Entity) {
        const res = this.reflection.describe(comps, entity);
        const name = this.cmd.arch.components.get(+entity)?.find((comp) => comp instanceof Name) as
            | Name
            | undefined;
        this.bind(comps, name);
        comps.forEach((comp) => this.triggerUpdate(comp));
        return res;
    }

    private bind(comps: Component[], name?: Name) {
        const cmd = this.cmd;
        const binding = cmd.getRes(BjsBindingPool);
        const scene = cmd.getRes(BjsResourceBundle).scene;
        const __name = name ?? comps.find((comp) => comp instanceof Name) as Name | undefined;
        if (!__name?.buf.name) return;
        const node = scene?.getNodeByName(__name.buf.name.toString());
        if (!node) return;
        comps.forEach((comp) => {
            binding.bind(comp, node);
        });
    }
    private triggerUpdate(comp: Component) {
        this.cmd.updateComp(comp, comp.buf);
    }

    injectCmdHooks() {
        this.cmd.updateComp = this.updateComp.bind(this);
        this.cmd.describe = this.describe.bind(this);
    }

    transformEntries(records: Record<string, SyncFunc>, pool: ComponentPool) {
        return Object.entries(records).map(([key, val]) => {
            return [pool.buf.get(key.replace("sync", "")), val] as [typeof Component, SyncFunc];
        });
    }

    addSyncMap(
        record: Iterable<[typeof Component<Struct>, SyncFunc]>,
    ) {
        for (const [key, sync] of record) {
            this.syncMap.buf.set(key, sync.bind(this));
        }
    }

    syncComp(comp: Component, newBuf: Component["buf"]) {
        const constructor = getConstructor(comp);
        const syncFunc = this.syncMap.buf.get(constructor);
        if (!syncFunc) return;
        syncFunc(comp, newBuf);
    }

    syncScene(scene: Scene) {
        const nodes = scene.getNodes();
        const queryResult = this.cmd.query(new QueryEC(Name)) ?? [];
        const syncedNames = new Set(queryResult.map(([_, name]) => {
            return name.buf.name;
        }));
        nodes.forEach((node) => {
            const { name } = node;
            if (syncedNames.has(name)) return;
            const name0 = new Name({ name });
            this.cmd.spawn(name0);
        });
    }
}
