import { ConstructorType } from "../../types/cons.ts";

export abstract class Default {
    abstract default(): InstanceType<this & ConstructorType>;
}
