import { Component } from "../../../../core/ecs/component.ts";

import type { Scalar } from "../../../../types/essential.ts";

export abstract class TextureBase<T extends Scalar> extends Component<T> {}
