export type Tree<A = unknown, T = unknown, P extends string = never> =
    & A
    & {
        [K in P]?: (T | Tree<A, T, P>)[];
    };

export type TreeNode<A = unknown, T = unknown, P extends string = never> = Tree<A, T, P>[P];
