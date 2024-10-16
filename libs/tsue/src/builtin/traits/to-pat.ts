import { Pattern } from "../pattern/obj.ts";

export abstract class ToPattern<Self = unknown, R = Self> {
    abstract toPattern(this: Self): Pattern<R>;
}
