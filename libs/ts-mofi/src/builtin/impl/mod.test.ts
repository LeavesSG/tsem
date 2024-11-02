import { ImplCtx, MarkImpl } from "./mod.ts";

class Robot {
    prefix = "I'm Robot.";
    sayHi() {
        console.log(this.prefix + "Hi!");
    }
}

interface SayGoodBye {
    sayGoodBey(): void;
}

interface Robot extends MarkImpl<SayGoodBye> {}

Deno.test("impl", () => {
    const ctx = new ImplCtx();

    ctx.impl<Robot, SayGoodBye>(Robot, {
        sayGoodBey() {
            console.log(this.prefix = "GoodBey!");
        },
    });
    const robot = new Robot();
    const impl = ctx.implOf(robot);
    console.log(impl.sayGoodBey());
});
