import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { PropPath } from "./prop-path.ts";

Deno.test("prop-path", () => {
    const obj = {
        name: "RootNode",
        children: [{
            name: "Leaf1",
        }, {
            name: "Leaf2",
        }],
    };

    const tracker = PropPath.from(obj).prop("children").prop(1).prop("name");
    assertEquals(tracker.probe(), obj["children"][1]["name"]);
});
