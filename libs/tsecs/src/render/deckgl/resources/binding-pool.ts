import { Pool } from "../../../preludes.ts";

import type { Node } from "@babylonjs/core.ts";
import type { Component } from "../../../core.ts";

export class BjsBindingPool extends Pool<Component, Node[]> {
    bind(comp: Component, node: Node) {
        const found = this.buf.get(comp);
        const vec = found ?? [];
        if (!vec.includes(node)) vec.push(node);
        if (!found) this.buf.set(comp, vec);
    }
}
