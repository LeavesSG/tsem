import type { Component } from "../../ecs/component.ts";
import type { Entity } from "../../ecs/entity.ts";
import type { Res } from "../res.ts";

/**
 * # Query
 * The object act as a media to query entities, components and resources from
 * `Architecture`.
 */
export abstract class Query<
    S = unknown,
    T extends SourceType = SourceType,
    R = unknown,
> {
    subject: S;
    cache: R | undefined;
    abstract sourceType: T;
    constructor(subject: S) {
        this.subject = subject;
    }
    abstract query(source: QuerySourceType<T>): R | undefined;
}

export enum SourceType {
    Component,
    Res,
}

export type QuerySourceType<T extends SourceType> = {
    [SourceType.Component]: IterableIterator<[Entity, Component[]]>;
    [SourceType.Res]: IterableIterator<[typeof Res, Res]>;
}[T];

export type QueryResult<T extends Query> = T extends Query<unknown, SourceType, infer R> ? R
    : never;
