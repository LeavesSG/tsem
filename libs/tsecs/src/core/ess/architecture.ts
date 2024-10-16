// deno-lint-ignore-file no-this-alias
import {
    applyMixins,
    ARCH_KEY,
    ARCHITECTURE,
    Architecture,
    ArchMixin,
    CONS_BUF,
    ConstructorType,
} from "../../../../tsue/src/lib.ts";
import { Component } from "../ecs/component.ts";

export class ECSArchMixin extends ArchMixin {
    declare [CONS_BUF]: (typeof Component)[];
}

export class ECSArchitecture<T extends [Component, ...Component[]]> extends Architecture<T> {
    declare _mixin: typeof ECSArchMixin & ConstructorType<T>;
    override mixin(): typeof ECSArchMixin & ConstructorType<T> {
        if (this._mixin) return this._mixin;
        const self = this;
        const newCons = applyMixins(
            class extends ArchMixin implements ECSArchMixin {
                [CONS_BUF] = self[CONS_BUF];
                [ARCH_KEY] = self[ARCH_KEY];
                [ARCHITECTURE] = self;
            },
            self[CONS_BUF],
        ) as unknown as typeof ECSArchMixin & ConstructorType<T>;
        this._mixin = newCons;
        return newCons;
    }
}
