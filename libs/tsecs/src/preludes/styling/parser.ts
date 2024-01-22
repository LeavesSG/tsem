import { QueryEC, Res } from "../../core.ts";
import { Name } from "../comp.ts";
import { ComponentBundlePool } from "../res/comp-bundle-pool.ts";
import { ComponentPool } from "../res/comp-pool.ts";

import type { Component } from "../../core.ts";
import type { Scalar } from "../../types/essential.ts";
import type { StylingBlock, StylingSheet } from "./styling-type.ts";

export class StylingParser extends Res {
    parse(sheet: StylingSheet) {
        sheet.forEach((block) => this.parseBlock(block));
    }
    parseBlock(block: StylingBlock) {
        const { selector, components, bundleKey, descriptors } = block;
        const matched = this.matchSelector(selector);
        const parsed = [
            ...new Set([
                ...components ?? [],
                ...this.parseBundle(bundleKey),
                ...this.parseDescriptors(descriptors),
            ]),
        ];
        matched.forEach(([entity]) => {
            const comps = new Set(this.cmd.arch.components.get(+entity) ?? []);
            this.cmd.describe(parsed.filter((comp) => !comps.has(comp)), entity);
        });
    }
    matchSelector(selector: StylingBlock["selector"]) {
        const regexp = typeof selector === "string" ? new RegExp(selector) : selector;
        const queryResult = this.cmd.query(new QueryEC(Name)) ?? [];
        return queryResult.filter(([_, name]) => {
            return regexp.exec(name.buf.name);
        });
    }
    parseBundle(bundleKey: StylingBlock["bundleKey"] = "") {
        if (bundleKey === "") return [];
        const parsed = new Set<Component<Scalar>>();
        const keys = bundleKey.split(" ");
        const bundleMgr = this.cmd.getRes(ComponentBundlePool);
        keys.forEach((key) => {
            const bundle = bundleMgr.buf.get(key);
            if (bundle) bundle.forEach((comp) => parsed.add(comp));
        });
        return parsed;
    }

    parseDescriptors(descriptors: StylingBlock["descriptors"] = []) {
        const pool = this.cmd.getRes(ComponentPool);
        const parsed: Component<Scalar>[] = [];
        descriptors.forEach(({ name, args }) => {
            const found = pool.buf.get(name);
            if (!found) return;
            parsed.push(new found(...args as ConstructorParameters<typeof found>));
        });
        return parsed;
    }
}
