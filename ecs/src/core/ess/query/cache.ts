import { SourceType, type Query, type QueryResult } from "./base.ts";
import { QueryEC } from "./variants/ec.ts";

import type { Component } from "../../ecs/component.ts";
import type { Architecture } from "../arch.ts";

export class QueryManager {
    cache = new Set<Query>();
    expire = new WeakMap<typeof Component, Set<Query>>();

    getCache<const Q extends Query>(query: Q): QueryResult<Q> {
        return query.cache as QueryResult<Q>;
    }

    setCache(query: Query, result: unknown[]) {
        this.cache.add(query);
        query.cache = result;
        if (query instanceof QueryEC) {
            const comps: typeof Component[] = [...query.__with, ...query.__without];
            comps.forEach((comp) => {
                const relatives = this.expire.get(comp) ?? new Set();
                this.expire.set(comp, relatives.add(query));
            });
        }
    }

    validateCache(comp: typeof Component) {
        const relatives = this.expire.get(comp);
        if (!relatives) return;
        relatives.forEach((query) => this.cache.delete(query));
    }

    query<const T extends Query>(
        query: T,
        arch: Architecture,
    ): QueryResult<T> | undefined {
        switch (query.sourceType) {
            case SourceType.Component: {
                return query.query(arch.components.entries()) as QueryResult<T>;
            }
            case SourceType.Res: {
                return query.query(arch.resources.entries()) as QueryResult<T>;
            }
        }
    }
}
