import { Query, SourceType } from "../base.ts";

import type { Index } from "../../../../types/essential.ts";
import type { Res } from "../../res.ts";

export type ResBundle<R extends { [index: Index]: typeof Res }> = {
    [key in keyof R]: InstanceType<R[key]>;
};
export class QueryResBundle<R extends { [index: Index]: typeof Res }> extends Query<
    R,
    SourceType.Res,
    ResBundle<R>
> {
    sourceType = SourceType.Res as const;
    __reflection: Map<typeof Res, string>;
    constructor(entries: R) {
        super(entries);
        this.__reflection = new Map(
            Object.entries(entries).map(([key, val]) => {
                return [val, key];
            }),
        );
    }

    query(
        source: IterableIterator<[typeof Res, Res]>,
    ): ResBundle<R> | undefined {
        const entries: [string, Res][] = [];
        for (const [Res, res] of source) {
            const key = this.__reflection.get(Res);
            if (key !== undefined) entries.push([key, res]);
        }
        if (entries.length === this.__reflection.size) {
            return Object.fromEntries(entries) as ResBundle<R>;
        }
    }
}
