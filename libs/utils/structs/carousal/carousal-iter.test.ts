import { CarousalIter } from "./carousal-iter.ts";

Deno.test("loop-iter", () => {
    const iter = ["1", "2", "3", "4"];
    const maxIter = 5;
    const reverse = false;
    const carousalIter = new CarousalIter(iter[Symbol.iterator](), {
        maxIter,
        reverse,
    });
    const iterableIter = {
        [Symbol.iterator]() {
            return carousalIter;
        },
    };
    for (const f of iterableIter) {
        console.log(f);
    }
});
