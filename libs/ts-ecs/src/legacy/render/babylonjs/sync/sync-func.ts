import { Mesh, StandardMaterial } from "@babylonjs/core.ts";

import { HashedResPool } from "../../../../preludes/res/hashed-pool.ts";
import { BjsBindingPool } from "../resources/binding-pool.ts";
import { HashedMatPool } from "../resources/mat-pool.ts";
import { HashedTextPool } from "../resources/text-pool.ts";

import type { Material } from "@babylonjs/core.ts";
import type { Commands, Component } from "../../../../core.ts";

const SHARED_MATERIALS = new Set<Material>();

export type SyncFunc<T extends Component = Component<any>> = (
    comp: T,
    newBuf: T["buf"],
) => void;

export function getNode(cmd: Commands, comp: Component) {
    const mgr = cmd.getRes(BjsBindingPool);
    const nodes = mgr.buf.get(comp) ?? [];
    return nodes;
}

export function getMesh(cmd: Commands, comp: Component) {
    const nodes = getNode(cmd, comp);
    const meshes: Mesh[] = [];
    nodes.forEach((node) => {
        if (!(node && node instanceof Mesh)) return;
        meshes.push(node);
    });
    return meshes;
}

export function getMaterial(cmd: Commands, comp: Component) {
    const meshes = getMesh(cmd, comp);
    return meshes.map((mesh) => {
        const material = mesh.material;
        if (!material || SHARED_MATERIALS.has(material)) {
            mesh.material = new StandardMaterial(mesh.name);
        }
        return mesh.material;
    });
}

export function getHashedRes<T>(cmd: Commands, key: string) {
    const pool = cmd.getRes(HashedResPool);
    if (!pool) return;
    return pool.buf.get(key) as T | undefined;
}

export function getHashedMat(cmd: Commands, key: string) {
    const pool = cmd.getRes(HashedMatPool);
    if (!pool) return;
    return pool.buf.get(key);
}

export function getHashedText(cmd: Commands, key: string) {
    const pool = cmd.getRes(HashedTextPool);
    if (!pool) return;
    return pool.buf.get(key);
}

export function addSharedMaterial(mat: Material) {
    if (SHARED_MATERIALS.has(mat)) return;
    SHARED_MATERIALS.add(mat);
}
