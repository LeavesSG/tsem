import { MeshBuilder, Vector3, type Scene } from "@babylonjs/core.ts";

import { Res } from "../../../core.ts";

import type { Feature, FeatureCollection, GeoJSON, MultiPolygon, Polygon, Position } from "geojson.ts";

interface Environment {
    name?: string;
    scene?: Scene;
    mapping?: (
        pos: Position,
        name?: string,
    ) => {
        shape: [number, number, number];
        path: [number, number, number];
        height: number;
    };
}

export class GeoJsonBuilder extends Res {
    env: Environment = {};
    setEnv(env: Partial<Environment>) {
        const syncKey = <const T extends keyof Environment>(key: T) => {
            this.env[key] = env[key];
        };
        Object.keys(env).forEach(syncKey as never);
    }

    parseGeoJson(geojson: GeoJSON) {
        switch (geojson.type) {
            case "Feature":
                return this.parseFeature(geojson);
            case "FeatureCollection":
                return this.parseCollection(geojson);
            case "MultiPolygon":
                return this.parseMultiPolygon(geojson);
            case "Polygon":
                return this.parsePolygon(geojson);
            default:
                return;
        }
    }

    parseFeature(feature: Feature) {
        const name = feature.properties?.name;
        if (!name) return;
        this.setEnv({ name });
        switch (feature.geometry.type) {
            case "MultiPolygon": {
                return this.parseMultiPolygon(feature.geometry);
            }
            case "Polygon": {
                return this.parsePolygon(feature.geometry);
            }
        }
    }

    parseCollection(collection: FeatureCollection) {
        return collection.features.map((feature) => {
            return this.parseFeature(feature);
        });
    }

    parseMultiPolygon(multiPolygon: MultiPolygon) {
        return multiPolygon.coordinates.map(([polygon]) => {
            return this.drawPolygon(polygon);
        });
    }

    parsePolygon(polygon: Polygon) {
        const polyCoords = polygon.coordinates[0];
        return [this.drawPolygon(polyCoords)];
    }

    drawPolygon(polyCoords: Position[]) {
        const { name, mapping, scene } = this.env;
        if (!name) return;
        const shape = polyCoords.map((pos) => {
            const vec3 = (pos.length === 3 ? pos : [pos[0], 0, pos]) as [number, number, number];
            return Vector3.FromArray(mapping?.(vec3).shape ?? vec3);
        });
        const path = polyCoords.map((pos) => {
            return Vector3.FromArray(mapping?.(pos).path ?? [0, 1, 0]);
        });
        const closeShape = true;
        const mesh = MeshBuilder.ExtrudeShapeCustom(name, { shape, path, closeShape }, scene);
        mesh.name = name;
        return mesh;
    }
}
