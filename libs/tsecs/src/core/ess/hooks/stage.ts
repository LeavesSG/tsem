export enum RenderStage {
    /**
     * Normally triggered each render loop.
     */
    Loop = 0x00,
    Pause,
    Resume,
}

export enum AppStage {
    /**
     * The stage before the app start.
     */
    Startup = 0x10,
    Start,
    /**
     * The stage when the app ends. This is the stage where you
     * planned to release the resources.
     */
    End,
}

export enum CommandStage {
    Spawn = 0x20,
    Drop,
    Describe,
    UpdateComp,
    Register,
    Query,
}

export type Stage = AppStage | RenderStage | CommandStage;
