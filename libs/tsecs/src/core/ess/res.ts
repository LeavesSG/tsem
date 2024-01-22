import type { Commands } from "./cmd.ts";

export abstract class Res {
    protected cmd: Commands;
    constructor(cmd: Commands) {
        this.cmd = cmd;
    }
}
