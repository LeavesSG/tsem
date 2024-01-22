import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Ordering } from "../cmp/mod.ts";
import { Architecture } from "./arch.ts";

Deno.test("Architecture", () => {
    enum Operation {
        Run,
        Walk,
        Talk,
        Jump,
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

    class Swim {
        swim() {
            return Operation.Jump;
        }
    }

    const mammal = Architecture.from(Walk, Run);
    const animal = Architecture.from(Run, Walk);
    const people = Architecture.from(Run, Walk, Talk);
    const fish = Architecture.from(Swim);

    const People = class extends people.mixin() {};
    const p1 = new People();

    assertEquals(mammal, animal);

    assertEquals(people.extends(mammal), true);
    assertEquals(mammal.extends(animal), true);
    assertEquals(animal.includes(animal), true);
    assertEquals(people.includes(animal), false);
    assertEquals(people.includes(animal), false);
    assertEquals(people.partialCmp(animal), Ordering.Less);
    assertEquals(people.partialCmp(fish), undefined);

    assertEquals(p1.walk(), Operation.Walk);
});
