import { Vec3 } from "./vecn.ts";

Deno.test("vecn", () => {
    type Color3 = Vec3<number>;
    type Color = [number, number, number];
    type AssertColor<T extends Color> = T;
    type AssertColor3<T extends Color3> = T;
    type z = AssertColor<Color3> & AssertColor3<Color>;
    const s: z = [1, 2, 3];
    s;
});
