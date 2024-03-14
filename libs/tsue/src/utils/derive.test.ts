import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Debug } from "../traits/mod.ts";
import { $Derive } from "./derive.ts";

Deno.test("Derive", () => {
    class Apple extends $Derive(Debug) {
        type = "apple";
    }
    const apple = new Apple();
    assertEquals(apple.debug(), `{"type":"apple"}`);
});
