import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Architecture } from "./arch.ts";

Deno.test("Architecture", () => {
    enum Operation {
        Run,
        Walk,
        Talk,
    }

    class Run {
        run() {
            return Operation.Run;
        }
    }
    class Walk {
        walk() {
            return Operation.Walk;
        }
    }
    class Talk {
        talk() {
            return Operation.Talk;
        }
    }

    const mammal = Architecture.from(Walk, Run);
    const animal = Architecture.from(Run, Walk);
    const people = Architecture.from(Run, Walk, Talk);
    const People = class extends people.mixin() {
    };

    const p1 = new People();

    assertEquals(mammal, animal);

    assertEquals(people.extends(animal), true);
    assertEquals(mammal.extends(animal), true);
    assertEquals(people.include(animal), false);
    assertEquals(people.include(animal), false);

    assertEquals(p1.archKey.toString(), (0b111).toString());
    assertEquals(p1.walk(), Operation.Walk);
});
