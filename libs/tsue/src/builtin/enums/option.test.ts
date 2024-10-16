import { Option } from "./option.ts";

Deno.test("option", () => {
    const some = Option.Some(1);
    const none = Option.None();
    console.log(some, none);
});
