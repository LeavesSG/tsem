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

    const mixture = Mixture.from([Cat, Dog, Koala]);
    const m = new mixture();
    m.meow();
    m.woff();
    m.zzz();
});
