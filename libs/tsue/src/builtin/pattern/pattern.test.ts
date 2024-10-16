import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { Pattern } from "./obj.ts";

Deno.test("pattern", () => {
    interface Student {
        name: string;
        age: number;
        dob: Date;
        fullName: string[];
        coord: [number, number];
    }
    const studentPattern = Pattern.from({
        name: String,
        age: Number,
        dob: Date,
        fullName: Pattern.asArray(String),
        coord: [Number, Number],
    });

    const studentA: Student = {
        age: 0,
        dob: new Date(),
        fullName: ["Issac", "Newton"],
        name: "Newton",
        coord: [0, 1],
    };
    console.log(studentPattern.match(studentA));
    assert(studentPattern.match(studentA));
    const notAStudent = {
        ...studentA,
        age: "0",
    };
    assertEquals(studentPattern.match(notAStudent), false);
});
