import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { Color } from "./color.ts";

Deno.test("color", () => {
    const hexString = "#00d6f980";
    const rgbaString = "rgba(0, 214, 249, 128)";
    const hexColor = Color.fromString(hexString);
    assertEquals(hexColor.toRGBAString(), rgbaString);
    const rgbaColor = Color.fromString(rgbaString);
    assertEquals(rgbaColor.toHexString(), "#00d6f980");

    const rgbString = "rgb(0,214,249)";
    const rgbColor = Color.fromString(rgbString);
    assertEquals(rgbColor.toHexString(), hexString.slice(0, -2));
});
