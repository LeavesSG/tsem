import { match, matchCase } from "./match.ts";

Deno.test("pattern-match", () => {
    const range = [0, 1];
    let m = match(range, matchCase([0, 0], (matched) => matched[1]), matchCase([0, 1], (matched) => matched[1]));
    console.log(m);
});
