import { Deck } from "@deck.gl/core/typed.ts";

import { Res } from "../../../../core.ts";
import { AppContainer } from "../../../../preludes.ts";

import type { Camera, Light, Scene, ShadowGenerator } from "@babylonjs/core.ts";
import type { Commands } from "../../../../core.ts";

export class BjsResourceBundle extends Res {
    scene?: Scene;
    camera?: Camera;
    light?: Light;
    shadowGenerator?: ShadowGenerator;
}

export class DeckResourceBundle extends Res {
    deck: Deck;
    constructor(cmd: Commands) {
        super(cmd);
        const parent = cmd.getRes(AppContainer).buf as HTMLDivElement;
        this.deck = new Deck({ parent });
    }
}
