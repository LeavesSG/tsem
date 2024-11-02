import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Mixture } from "./mixture.ts";

Deno.test("Mixture", () => {
    class Cat {
        meow() {
            console.log("m");
        }
    }

    class Dog {
        woff() {
            console.log("w");
        }
    }

    class Koala {
        zzz() {
            console.log("k");
        }
    }

    const mixture = Mixture.from(Cat, Dog, Koala);
    const m = new mixture();
    m.meow();
    m.woff();
    m.zzz();
    const mixture2 = Mixture.from(Dog, Koala, Cat);
    assertEquals(mixture.equals(mixture2), true);
});
