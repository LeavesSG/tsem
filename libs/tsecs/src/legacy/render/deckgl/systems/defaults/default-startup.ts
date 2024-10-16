import { DeckResourceBundle } from "../../resources.ts";

import type { System } from "../../../../../core.ts";

const INITIAL_VIEW_STATE = {
    latitude: 37.8,
    longitude: -122.45,
};

export const defaultStartup: System = (cmd) => {
    const { deck } = cmd.getRes(DeckResourceBundle);
    deck.setProps({
        initialViewState: INITIAL_VIEW_STATE,
        controller: true,
    });
};
