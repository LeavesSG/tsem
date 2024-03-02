import type { Tree } from "./tree.ts";

type GetChildren<T> = (node: T) => T[];

/**
 * 判断节点是否有子节点并辅助类型推断的工具方法
 */
export function hasChildren<T extends object>(node: T): node is T & { children: [T, ...T[]] } {
    return ("children" in node && Array.isArray(node.children) && node.children.length > 0) || false;
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
