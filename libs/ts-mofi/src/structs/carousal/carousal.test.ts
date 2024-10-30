import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Carousal } from "./carousal.ts";

Deno.test("carousal", async () => {
    const data = [{ name: "Tom", value: 1 }, { name: "James", value: 12 }];
    const logged: string[] = [];
    const carousal = Carousal.from(data, (val) => logged.push(val.name), {
        interval: 100,
    });
    carousal.start();

    await new Promise<void>((res) => {
        setTimeout(() => {
            carousal.pause();
        }, 250);

        setTimeout(() => {
            carousal.resume();
        }, 550);

        setTimeout(() => {
            carousal.stop();
            res();
        }, 600);
    });
    assertEquals(JSON.stringify(logged), `["Tom","James","Tom","James"]`);
});
