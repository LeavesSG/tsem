import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { _ } from "../pattern/pattern.ts";
import { SYMBOL_TO_PATTERN } from "../pattern/to-pattern.ts";
import { PropPath } from "./prop-path.ts";

Deno.test("prop-path", () => {
    const obj = {
        name: "RootNode",
        children: [{
            name: "Leaf1",
        }, {
            name: "Leaf2",
        }],
        [SYMBOL_TO_PATTERN]() {
            return _;
        },
    };
    const tracker = PropPath.from(obj).prop("children").prop(1).prop("name");
    assertEquals(tracker.touch(), obj["children"][1]["name"]);
});
