import { NotImplementedError } from "../errors/not-implement.ts";
import { Pattern } from "../pattern/mod.ts";
import { Err, isOk, Ok, Result } from "../result/mod.ts";
import { Vec4 } from "../vecn/vecn.ts";
import { ColorForm, ColorPatterns } from "./color-type.ts";

export class Color extends Array<number> implements Vec4<number> {
    0: number;
    1: number;
    2: number;
    3: number;
    declare length: 4;

    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        super(r, g, b, a);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    get r() {
        return this[0];
    }
    set r(value: number) {
        this[0] = value;
    }

    get g() {
        return this[1];
    }
    set g(value: number) {
        this[1] = value;
    }

    get b() {
        return this[2];
    }
    set b(value: number) {
        this[2] = value;
    }

    get a() {
        return this[3];
    }
    set a(value: number) {
        this[3] = value;
    }

    static fromString(expr: unknown) {
        if (Pattern.from("string").match(expr)) {
            const res = this.tryParse(expr);

            if (isOk(res)) {
                return res.unwrap();
            }
        }
        return new this();
    }

    static tryParse(expr: string, form?: ColorForm): Result<Color, Error> {
        if (form) {
            if (ColorPatterns[form].match(expr)) {
                return Ok(this.parse(expr, form));
            }
        } else {
            for (const [key, value] of Object.entries(ColorPatterns)) {
                if (value.match(expr)) {
                    return Ok(this.parse(expr, Number(key)));
                }
            }
        }
        return Err("Invalid Expression!");
    }

    static parse(expr: string, form: ColorForm): Color {
        switch (form) {
            case ColorForm.HEX: {
                return this.fromHexString(expr);
            }
            case ColorForm.RGBA: {
                return this.fromRGBAString(expr);
            }
            case ColorForm.HSLA: {
                throw new NotImplementedError();
            }
        }
    }

    static parseHexStr(exp = "f") {
        const converted = Number(`0x${exp || "f"}`);
        const max = Math.pow(16, exp.length || 1) - 1;
        return converted / max;
    }

    static fromHexString(hexStr: string) {
        const sliced = hexStr.slice(1);
        let r, g, b, a;
        switch (sliced.length) {
            case 3:
            case 4:
                r = sliced.slice(0, 1), g = sliced.slice(1, 2), b = sliced.slice(2, 3), a = sliced.slice(3, 4);
                break;
            case 6:
            case 8:
                r = sliced.slice(0, 2), g = sliced.slice(2, 4), b = sliced.slice(4, 6), a = sliced.slice(6, 8);
                break;
            default:
                [r, g, b, a] = ["f", "f", "f", "f"];
        }
        [r, g, b, a] = [r, g, b, a].map((h) => Color.parseHexStr(h));
        return new Color(r, g, b, a);
    }

    static fromRGBAString(expr: string) {
        if (expr.includes("rgba")) {
            const sliced = expr.slice(5, -1);
            const [r, g, b, a] = sliced.split(",").map((d) => Math.min(Number(d) / 255, 1)).concat(
                1,
            );
            return new Color(r, g, b, a);
        } else {
            const sliced = expr.slice(4, -1);
            const [r, g, b, a] = sliced.split(",").map((d) => Math.min(Number(d) / 255));
            return new Color(r, g, b, a);
        }
    }

    toArray(): Vec4<number> {
        return [this.r, this.g, this.b, this.a];
    }

    toIntArray(base = 255): Vec4<number> {
        return this.toArray().map((f) => Math.round(f * base)) as Vec4<number>;
    }

    toHexString() {
        let hexString = `#${this.toIntArray().map((int) => int.toString(16).padStart(2, "0")).join("")}`;
        if (hexString.slice(7, 9) === "ff") hexString = hexString.slice(0, -2);
        return hexString;
    }

    toRGBString() {
        return `rgb(${this.toIntArray().slice(0, -1).join(", ")})`;
    }

    toRGBAString() {
        return `rgba(${this.toIntArray().join(", ")})`;
    }
}
