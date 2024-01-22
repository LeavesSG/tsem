import { Component } from "../../../../core/ecs/component.ts";

import type { Scalar } from "../../../../types/essential.ts";

export abstract class ColorBase<T extends Scalar> extends Component<T> {}
