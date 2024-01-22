import { Pool } from "../pool.ts";

import type { Index } from "../../types/essential.ts";

export class HashedResPool<K extends Index = Index, V = unknown> extends Pool<K, V> {}
