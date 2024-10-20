import { Pattern } from "./pattern.ts";

const isUnknown = (_target: unknown): _target is unknown => {
    return true;
};

export const _ = new Pattern(isUnknown);
