import { Vec3 } from "../../vecn/vecn.ts";
import { AbstractCoords3, AxisType } from "./abstract-coords3.ts";

export class CartesianCoords extends AbstractCoords3 {
    override type = [AxisType.Length, AxisType.Length, AxisType.Length] as Vec3<AxisType>;

    get x() {
        return this[0];
    }
    set x(val) {
        this[0] = val;
    }
    get y() {
        return this[1];
    }
    set y(val) {
        this[1] = val;
    }
    get z() {
        return this[2];
    }
    set z(val) {
        this[2] = val;
    }
}
