import { _ } from "../pattern/markers.ts";
import { identity } from "./markers.ts";
import { match } from "./mod.ts";

Deno.test("match", () => {
    enum Fruit {
        Apple,
        Banana,
        Orange,
    }
    const s: Fruit = Fruit.Apple;
    let res = match(s).case(_, identity);
    res.exec();
    console.log(res);
});
