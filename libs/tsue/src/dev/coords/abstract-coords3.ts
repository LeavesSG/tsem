import { Vec3 } from "../../vecn/vecn.ts";

export enum AxisType {
    Length,
    Radius,
}

export abstract class AbstractCoords3 extends Array<number> implements Vec3<number> {
    0: number;
    1: number;
    2: number;
    override length = 3 as const;
    abstract type: [AxisType, AxisType, AxisType];
    constructor(e1: number = 0, e2 = 0, e3 = 0) {
        super(e1, e2, e3);
    }
}
