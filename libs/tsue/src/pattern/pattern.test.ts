import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Pattern } from "./pattern.ts";
Deno.test("pattern", () => {
    const pat3 = Pattern.fromArray({
        name: "string",
        value: "number",
        timeRange: [Date, Date],
    }); // array struct;
    assertEquals(
        pat3.match([{ name: "Tom", value: 1, timeRange: [new Date(), new Date()] }]),
        true,
    );
    assertEquals(
        pat3.match([{ name: "Harry", value: 2 }, { name: "Hermione", value: 100 }], "info"),
        false,
    );
});
