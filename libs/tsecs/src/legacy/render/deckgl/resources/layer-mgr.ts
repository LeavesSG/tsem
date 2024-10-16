import { type Deck, type Layer } from "@deck.gl/core/typed.ts";

import { Res } from "../../../../core.ts";

import { DeckResourceBundle } from "./bundle.ts";

import type { Commands } from "../../../../core.ts";

export class LayerMgr extends Res {
    private deck: Deck;
    private __layers = new Map<string, Layer>();
    constructor(cmd: Commands) {
        super(cmd);
        this.deck = cmd.getRes(DeckResourceBundle).deck;
    }

    get layers() {
        return [...this.__layers.values()];
    }

    addLayer(...layers: Layer[]) {
        layers.forEach((layer) => this.__layers.set(layer.id, layer));
        this.deck.setProps({ layers: this.layers });
    }
    removeLayer(...layers: Layer[]) {
        layers.forEach((layer) => this.__layers.delete(layer.id));
        this.deck.setProps({ layers: this.layers });
    }
}
