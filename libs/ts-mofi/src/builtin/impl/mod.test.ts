import { impl, MarkImpl, withImpl } from "./mod.ts";

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
    impl<Robot, SayGoodBye>(Robot, {
        sayGoodBey() {
            console.log(this.prefix = "GoodBey!");
        },
    });
    const robot = new Robot();
    const implObj = withImpl(robot);
    implObj.sayGoodBey();
});
