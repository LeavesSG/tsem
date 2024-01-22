import { Query, SourceType } from "../base.ts";

import type { Res } from "../../res.ts";

export class QueryRes<R extends typeof Res = typeof Res>
    extends Query<R, SourceType.Res, InstanceType<R>> {
    sourceType = SourceType.Res as const;

    query(source: IterableIterator<[typeof Res, Res]>) {
        for (const [Res, res] of source) {
            if (Res === this.subject) return res as InstanceType<R>;
        }
    }
}
