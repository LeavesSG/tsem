import { AppStage, RenderStage } from "./hooks/stage.ts";

import type { Stage } from "./hooks/stage.ts";

type ScheduleCallback = (...args: never[]) => unknown;

export class Schedule {
    stage: Stage = AppStage.Startup;
    registered: Map<Stage, Set<ScheduleCallback>> = new Map();

    isOnce(stage: Stage) {
        return stage !== RenderStage.Loop;
    }

    isEager(stage: Stage) {
        return this.stage === stage;
    }

    move(stage: Stage) {
        this.jump(stage);
        this.trigger(stage);
    }

    jump(stage: Stage) {
        this.stage = stage;
    }

    trigger(stage: Stage) {
        const collections = this.registered.get(stage);
        if (!collections) return;
        collections.forEach((cb) => {
            cb();
        });
        if (this.isOnce(stage)) {
            collections.clear();
        }
    }

    register(callback: ScheduleCallback, stage: Stage = RenderStage.Loop) {
        const collections = this.registered.get(stage) ?? new Set();
        if (this.isEager(stage)) {
            callback();
            if (!this.isOnce(stage)) {
                collections.add(callback);
            }
        } else {
            collections.add(callback);
        }
        this.registered.set(stage, collections);
    }
}
