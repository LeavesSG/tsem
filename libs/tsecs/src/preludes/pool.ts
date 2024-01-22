import { Res } from "../core/ess/res.ts";

import type { Commands } from "../core/ess/cmd.ts";

export class Pool<T, U> extends Res {
    buf: Map<T, U>;
    constructor(cmd: Commands, entries?: Iterable<readonly [T, U]> | null) {
        super(cmd);
        this.buf = new Map(entries);
    }
}
