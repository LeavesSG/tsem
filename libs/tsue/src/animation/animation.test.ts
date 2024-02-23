import { Animation } from "./mod.ts";

Deno.test("animation", async () => {
    const animation = new Animation({
        duration: Infinity,
    });
    animation.onTick((pt, { runTick }) => {
        console.log(pt, runTick);
    }).play();

    await new Promise(res =>
        setTimeout(() => {
            animation.pause();
            res(void 0);
        }, 2000)
    );
});
