import { HashedResPool } from "../../../preludes.ts";

import type { Texture } from "@babylonjs/core.ts";

export class HashedTextPool extends HashedResPool<string, Texture> {}
