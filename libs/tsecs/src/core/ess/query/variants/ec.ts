import { Query, SourceType } from "../base.ts";

import type { Scalar } from "../../../../types/essential.ts";
import type { Component } from "../../../ecs/component.ts";
import type { Entity } from "../../../ecs/entity.ts";

export class QueryEC<
    const C extends typeof Component<Scalar> = typeof Component<Scalar>,
    const W extends typeof Component<Scalar>[] = [],
> extends Query<
    C,
    SourceType.Component,
    [Entity, InstanceType<C>][]
> {
    sourceType = SourceType.Component as const;
    __with = [] as unknown as W;
    __without: typeof Component[] = [];

    with<const W2 extends typeof Component>(comps: W2): QueryEC<C, [...W, W2]> {
        this.__with.push(comps);
        return this.__with as unknown as QueryEC<C, [...W, W2]>;
    }
    without(...comps: typeof Component[]) {
        this.__without.push(...comps);
        return this;
    }
    match(comps: Component[]) {
        return comps.every((comp) => {
            const withComp = [this.subject, ...this.__with].some((Comp) => comp instanceof Comp);
            const withoutComp = this.__without.every((Comp) => !(comp instanceof Comp));
            return withComp && withoutComp;
        });
    }

    query(
        source: IterableIterator<[number, Component<Scalar>[]]>,
    ): [Entity, InstanceType<C>][] {
        const res = [];
        for (const [entity, comps] of source) {
            if (this.match(comps)) {
                const found = comps.find((comp) => comp instanceof this.subject);
                if (found) {
                    res.push([entity, found as InstanceType<C>] as [Entity, InstanceType<C>]);
                }
            }
        }
        return res;
    }
}
