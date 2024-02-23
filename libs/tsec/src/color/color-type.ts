import { Pattern } from "../pattern/pattern.ts";

export enum ColorForm {
    HEX,
    RGBA,
    HSLA,
}

export const ColorPatterns = {
    [ColorForm.HEX]: Pattern.from(/^#[\da-fA-F]{3,8}$/),
    [ColorForm.RGBA]: Pattern.fromUnion([/^rgb\((\d{1,3},\s*){2}\d{1,3}\)$/, /^rgba\((\d{1,3},\s*){3}\d{1,3}\)$/]),
    [ColorForm.HSLA]: Pattern.from(Symbol()),
};
