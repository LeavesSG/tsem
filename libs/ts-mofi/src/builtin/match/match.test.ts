import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { builder, EnumStruct } from "../enum-struct/mod.ts";
import { Option } from "../enums/option.ts";
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
    const p1 = Pat.enumOf(Val, "Num");
    const p2 = Pat.enumOf(Val, "Str");
    const mt = match(source);
    const res = mt.case(p1, e => String(e.value)).case(p2, e => e.value).exec();
    assertEquals(res, "123");

    const some1 = Option.Some(1) as Option<number>;
    const p = match(some1)
        .case(Pat.enumOf(Option<number>, "Some"), e => e.value)
        .case(Pat.enumOf(Option<number>, "None"), _ => 0).exec();
    assertEquals(p, 1);
    const p3 = match(some1)
        .case(Pat.enumOf(Option<number>, "None"), _ => 0).forceExhaustive().exec();
    assertEquals(p3, 0);
});
