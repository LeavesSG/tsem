import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { number, Pattern, string } from "./pattern.ts";

Deno.test("pattern", () => {
    interface Student {
        name: string;
        age: number;
        dob: Date;
        fullName: string[];
        coords: [number, number];
    }
    const studentPattern = Pattern.from({
        name: string,
        age: number,
        dob: Date,
        fullName: Pattern.arrOf(string),
        coords: [number, number],
    });

    const studentA: Student = {
        age: 0,
        dob: new Date(),
        fullName: ["Issac", "Newton"],
        name: "Newton",
        coords: [0, 1],
    };

    studentPattern.assert(studentA);
    const notAStudent = {
        ...studentA,
        coords: ["0", "1"],
    };
    const res = studentPattern.exec(notAStudent);
    if (res.isErr()) {
        console.log(res.value.debug());
    }
    assertEquals(res.isOk(), false);
});
