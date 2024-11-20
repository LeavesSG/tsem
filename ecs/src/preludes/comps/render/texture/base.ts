import { Component } from "../../../../core/ecs/component.ts";

import type { Struct } from "../../../../types/essential.ts";

export abstract class TextureBase<T extends Struct> extends Component<T> {}
