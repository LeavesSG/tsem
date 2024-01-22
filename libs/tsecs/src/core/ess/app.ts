import { Architecture } from "./arch.ts";
import { Commands } from "./cmd.ts";
import { AppStage, RenderStage } from "./hooks/stage.ts";
import { Schedule } from "./schedule.ts";

import type { Concrete } from "../../types/essential.ts";
import type { System } from "../ecs/system.ts";
import type { Plugin } from "./plugin.ts";

export class App {
    arch = new Architecture();
    schedule = new Schedule();

    cmd = new Commands(this.arch, this.schedule);

    addPlugin(plugin: Concrete<typeof Plugin>) {
        new plugin().build(this);
        return this;
    }

    addStartupSystem(sys: System) {
        this.schedule.register(() => sys(this.cmd), AppStage.Startup);
        return this;
    }

    addSystem(sys: System) {
        this.schedule.register(() => sys(this.cmd));
        return this;
    }

    addEndSystem(sys: System) {
        this.schedule.register(sys, AppStage.End);
        return this;
    }

    start() {
        this.schedule.move(AppStage.Start);
        this.loop();
        return this;
    }

    end() {
        this.schedule.move(AppStage.End);
        return this;
    }

    loop() {
        if (this.schedule.stage !== RenderStage.Loop) this.schedule.move(RenderStage.Loop);
        else this.schedule.trigger(RenderStage.Loop);
        return this;
    }
}
