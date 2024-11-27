import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Mixture } from "./mixture.ts";

Deno.test("Mixture", () => {
    class Cat {
        meowWord!: string;
        meowCb!: () => any;
        meow() {
            console.log("m");
        }
    }

    class Dog {
        woffWord?: string;
        woff() {
            console.log("w");
        }
    }

    class Koala {
        zzzWord!: string;
        zzz() {
            console.log("k");
        }
    }

    const mixture = new Mixture(Cat, Dog, Koala);
    const m = new mixture();
    m.meow();
    m.woff();
    m.zzz();
    const mixture2 = new Mixture(Cat, Dog, Koala);
    assertEquals(mixture.equals(mixture2), true);
});
