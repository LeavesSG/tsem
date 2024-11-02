import { ImplCtx } from "./mod.ts";

Deno.test("impl", () => {
    const ctx = new ImplCtx();
    class Robot {
        prefix = "I'm Robot.";
        sayHi() {
            console.log(this.prefix + "Hi!");
        }
    }
    ctx.impl(Date, {
        sayGoodBey() {
            console.log(this.prefix = "GoodBey!");
        },
    });
    const date = new Robot();
    ctx.getImpl(date).sayGoodBey();
});
