export enum ColorForm {
    HEX,
    RGBA,
}
type Vec4<T> = [T, T, T, T];
type ColorHexString = `#${string}`;
type ColorRGBString = `rgb${string}`;
type ColorRGBAString = `rgba(${string})`;

export type ValidColorExpr = ColorHexString | ColorRGBString | ColorRGBAString;
export const ColorPatterns = {
    [ColorForm.HEX]: (expr: string) => /^#[\da-fA-F]{3,8}$/.test(expr),
    [ColorForm.RGBA]: (expr: string) =>
        [/^rgb\((\d{1,3},\s*){2}\d{1,3}\)$/, /^rgba\((\d{1,3},\s*){3}\d{1,3}\)$/].some((pattern) => pattern.test(expr)),
};

export class Color extends Array<number> {
    0: number;
    1: number;
    2: number;
    3: number;
    declare length: 4;

    constructor(r = 1, g = 1, b = 1, a = 1) {
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

    static override from(expr: unknown) {
        if (Array.isArray(expr) && expr.every((val) => typeof val === "number" && val >= 0 && val <= 1)) {
            return new this(...expr);
        }
        if (typeof expr === "string") {
            const res = this.tryParse(expr);
            if (res) return res;
        }
        return new this();
    }

    static tryParse(expr: string, form?: ColorForm) {
        if (form) {
            if (ColorPatterns[form](expr)) {
                return this.parse(expr, form);
            }
        } else {
            for (const [key, matchFunc] of Object.entries(ColorPatterns)) {
                if (matchFunc(expr)) {
                    return this.parse(expr, Number(key));
                }
            }
        }
        return undefined;
    }

    static parse(expr: string, form: ColorForm): Color {
        switch (form) {
            case ColorForm.HEX: {
                return this.fromHexString(expr);
            }
            case ColorForm.RGBA: {
                return this.fromRGBAString(expr);
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
                [r, g, b, a] = sliced;
                break;
            case 6:
            case 8:
                r = sliced.slice(0, 2);
                g = sliced.slice(2, 4);
                b = sliced.slice(4, 6);
                a = sliced.slice(6, 8);
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
            const [r, g, b, a] = sliced
                .split(",")
                .map((d) => Math.min(Number(d) / 255, 1))
                .concat(1);
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
        let hexString = `#${
            this.toIntArray()
                .map((int) => int.toString(16).padStart(2, "0"))
                .join("")
        }`;
        if (hexString.slice(7, 9) === "ff") hexString = hexString.slice(0, -2);
        return hexString as ColorHexString;
    }

    toRGBString() {
        return `rgb(${this.toIntArray().slice(0, -1).join(", ")})` as ColorRGBString;
    }

    toRGBAString() {
        return `rgba(${this.toIntArray().join(", ")})` as ColorRGBAString;
    }
}
