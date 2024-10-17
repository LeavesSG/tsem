import { Pool } from "../pool.ts";

import type { Component } from "../../core/ecs/component.ts";
import type { Struct } from "../../types/essential.ts";

export class ComponentBundlePool extends Pool<string, Component<Struct>[]> {}
