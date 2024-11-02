import { ImplCtx } from "./mod.ts";

class Robot {
    prefix = "I'm Robot.";
    sayHi() {
        console.log(this.prefix + "Hi!");
    }
}

Deno.test("impl", () => {
    const ctx = new ImplCtx();

    // type m =

    ctx.impl(Robot, {
        sayGoodBey() {
            console.log(this.prefix = "GoodBey!");
        },
    });
    const robot = new Robot();
    const impl = ctx.getImpl(robot);
    console.log(impl.sayGoodBey());
});
