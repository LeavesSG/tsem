import type { Option } from "./option.ts";

export enum Ordering {
    Less,
    Equal,
    Greater,
}

export type PartialOrdering = Option<Ordering>;
