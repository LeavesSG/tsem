import type { App } from "./app.ts";

export abstract class Plugin {
    abstract build(app: App): void;
}
