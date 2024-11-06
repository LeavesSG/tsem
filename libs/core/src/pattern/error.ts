import type { Debug } from "../traits/debug.ts";

export class MatchFailedError extends Error implements Debug {
    declare cause: MatchFailedError;
    debug(): string {
        let str = `Match failed: ${this.message}.\n`;
        let ptr = this.cause;
        while (ptr) {
            str += `Caused by: ${ptr.message}.\n`;
            ptr = ptr.cause;
        }
        return str;
    }

    static inst(message?: string, options?: ErrorOptions): MatchFailedError {
        return new this(message, options);
    }
}
