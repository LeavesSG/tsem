import { builder, EnumStruct } from "../enum-struct/mod.ts";
import type { ParseStructPatExpr } from "../pattern/expr.ts";
import { match } from "./mod.ts";

Deno.test("match", () => {
    interface Value {
        Str: string;
        Num: number;
    }
    class Val<V extends keyof Value = keyof Value> extends EnumStruct<Value, V> {
        static Str = builder(this, "Str");
        static Num = builder(this, "Num");
    }

    let m = Val.Str("number") as Val;
    type m1 = ParseStructPatExpr<Value>;
    match(m).case(Val.Str("string"), (item) => {
        return item.value;
    });
});
