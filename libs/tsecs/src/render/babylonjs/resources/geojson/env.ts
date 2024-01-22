export class SpatialVector3 {
    private buf: [number, number, number];
    constructor(x: number, y: number, z: number) {
        this.buf = [x, y, z];
    }
    static FromSpherical(theta: number, phi: number, radius: number) {
        const rc = radius * Math.cos(phi);
        return new this(rc * Math.cos(theta), rc * Math.sin(theta), radius * Math.sin(phi));
    }
    static FromCoord(lon: number, lat: number, radius: number) {
        return this.FromSpherical(radius, lon / 180 * Math.PI, lat / 180 * Math.PI);
    }
    toArray() {
        return this.buf;
    }
}

interface MappingResult {
    // mapping coord of each vertex to vector3 position in world3 coord.
    shape?: [number, number, number];
    // extrude vector on each vertex
    path?: [number, number, number];
    // extrude height
    height?: number;
}

type BuilderMapping = (pos: [number, number, number], name?: string) => MappingResult;

export const fillToVec3 = (vec2Or3: number[]) => {
    return (vec2Or3.length === 3 ? vec2Or3 : [vec2Or3[0], 0, vec2Or3[1]]) as [
        number,
        number,
        number,
    ];
};

export const defaultMapping: BuilderMapping = (pos: number[]) => {
    return {
        shape: fillToVec3(pos),
        path: [0, 1, 0],
        height: 0,
    };
};

export const useEarthMapping: (diameter: number) => BuilderMapping = (diameter: number) => {
    const radius = diameter / 2;
    return ([lon, lat]: number[]) => {
        const space = SpatialVector3.FromCoord(lon, lat, radius);
        return {
            shape: space.toArray(),
            path: [0, 1, 0],
            height: 0,
        };
    };
};
