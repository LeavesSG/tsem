import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Cmp } from "../preludes/traits/cmp.ts";
import { Ord } from "../preludes/traits/ord.ts";

Deno.test("test-impl", () => {
    class NumberCmpImpl extends Cmp<number, number> {
        cmp(this: number, other: number): Ord {
            if (this > other) return Ord.Greater;
            if (this === other) return Ord.Equal;
            return Ord.Less;
        }
    }

    const numberCmpImpl = new NumberCmpImpl();
    const impl = (n: number) => {
        const num = new Number(n);
        return new Proxy(num, {
            get(target, p, receiver) {
                if (
                    typeof p === "string" && p in numberCmpImpl
                    && typeof numberCmpImpl[p as string & keyof NumberCmpImpl] === "function"
                ) {
                    return numberCmpImpl[p as string & keyof NumberCmpImpl].bind(target as number);
                }
                return Reflect.get(target, p, receiver);
            },
        });
    };

    assertEquals(impl(5).cmp(4), Ord.Greater);
    assertEquals(impl(5.4).toFixed(2), "5.40");
});
