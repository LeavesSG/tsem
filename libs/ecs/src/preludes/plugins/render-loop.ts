import { App, Plugin } from "../../core.ts";
import { AppStage, RenderStage } from "../../core/ess/hooks/stage.ts";

export class RenderLoop extends Plugin {
    build(app: App): void {
        try {
            requestAnimationFrame(() => {});
            app.addStartupSystem(() => {
                const loop = () => {
                    if (app.schedule.stage === AppStage.End) return;
                    requestAnimationFrame(loop);
                    if (app.schedule.stage === RenderStage.Loop) {
                        app.loop();
                    }
                };
                requestAnimationFrame(loop);
            });
        } catch (error) {
            console.error(
                "Ecs RenderLoop plugin not installed: Might not be running on a DOM environment.",
            );
        }
    }
}
