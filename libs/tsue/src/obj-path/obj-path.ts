import { debugPrint } from "../debug/debug-print.ts";

export class IndexTracing<const T = unknown> {
    obj?: T;
    buffer: (string | number | symbol)[];

    constructor(obj: T, path: (string | number | symbol)[]) {
        this.obj = obj;
        this.buffer = path;
    }

    toJSONPath() {
        let str = "$";
        for (const prop of this.buffer) {
            if (typeof prop === "number") {
                str += `[${prop}]`;
            } else if (typeof prop === "symbol") {
                str += `[${Symbol.toString()}]`;
            } else {
                str += `.${prop}`;
            }
        }
        return str;
    }

    pop() {
        return new IndexTracing(
            this.obj,
            this.buffer.slice(-1),
        );
    }

    add(prop: string | number | symbol) {
        return new IndexTracing(
            this.obj as T,
            [...this.buffer, prop],
        );
    }

    getValue(
        visit = (ptr: Record<string | number | symbol, never>, prop: string | number | symbol) => ptr[prop],
    ) {
        if (!this.obj) return undefined;
        let ptr = this.obj;
        for (const prop of this.buffer) {
            ptr = visit(ptr, prop as never);
            if (!ptr) return ptr;
        }
        return ptr;
    }

    tryPrintValue() {
        return debugPrint(this.getValue());
    }
}

export type ToJSONPath<P extends (string | number | symbol)[], JP extends string = `$`> = P extends
    [infer Prop extends string, ...infer R extends string[]]
    ? Prop extends `${number}` ? ToJSONPath<R, `${JP}[${Prop}]`> : ToJSONPath<R, `${JP}.${Prop}`>
    : JP;
