import type { Tree } from "../types/tree.ts";

type GetChildren<T> = (node: T) => T[];

export function hasChildren<T extends object, U extends keyof T>(
    node: T,
    propName = "children" as U,
): node is T & { children: [T, ...T[]] } {
    if (!(propName in node)) return false;
    const children = node[propName as unknown as keyof T];
    return Array.isArray(children);
}

/**
 * Generate a Iterator that traverse a recursive structure.
 * @param tree the root node, that contains children node in its `children` property, Or provide "getChildren" param
 * @param getChildren the method that takes node as argument and returns its child
 * @returns IterableIterator of given recursive structure.
 */
export function* traverseTree<T extends Tree>(
    tree: T,
    getChildren: GetChildren<T> = (node: T) => (hasChildren(node) && node.children) || [],
): Generator<T, void, void> {
    yield tree;

    const children = getChildren(tree);
    for (const child of children) {
        yield* traverseTree(child, getChildren);
    }
}

interface EmitInfo<T> {
    depth: number;
    parent: T | null;
}

const EMIT_BASE: EmitInfo<never> = {
    depth: 0,
    parent: null,
};

/**
 * Generate a Iterator that traverse a recursive structure and emits useful meta infos.
 * @param tree the root node, that contains children node in its `children` property, Or provide "getChildren" param
 * @param getChildren the method that takes node as argument and returns its child
 * @returns IterableIterator of given recursive structure.
 */
export function* traverseTreeWithEmits<T extends Tree>(
    tree: T,
    getChildren: GetChildren<T> = (node: T) => (hasChildren(node) && node.children) || [],
    emits: EmitInfo<T> = EMIT_BASE,
): Generator<[T, EmitInfo<T>], void, void> {
    yield [tree, emits];

    const children = getChildren(tree);
    for (const child of children) {
        yield* traverseTreeWithEmits(child, getChildren, {
            depth: emits.depth + 1,
            parent: tree,
        });
    }
}
