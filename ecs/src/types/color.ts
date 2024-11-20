type ColorHexString = `#${string}`;
type ColorFunc = `${"rgb" | "hsl" | "rgba"}(${string})`;

export type ColorExpr = ColorHexString | ColorFunc;

export enum ColorType {
    Diffuse = "diffuseColor",
    Emissive = "emissiveColor",
    Specular = "specularColor",
}
