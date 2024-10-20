import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { builder, EnumStruct } from "../enum-struct/mod.ts";
import { Pat } from "../pattern/pattern.ts";
import { match } from "./match.ts";

Deno.test("match", () => {
    interface Value {
        Str: string;
        Num: number;
    }
    class Val<V extends keyof Value = keyof Value> extends EnumStruct<Value, V> {
        static Str = builder(this, "Str");
        static Num = builder(this, "Num");
    }
    const source = Val.Str("123") as Val;
    const res = match(source).case(Pat.enum(Val, "Num"), e => String(e.value)).case(Pat.enum(Val, "Str"), e => e.value)
        .exec();
    assertEquals(res, "123");
});
