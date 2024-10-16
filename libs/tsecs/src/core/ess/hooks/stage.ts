export enum RenderStage {
    /** Normally triggered each render loop. */
    Loop = 0x00,
    Pause,
    Resume,
}

export enum AppStage {
    /** Before the app start.*/
    Startup = 0x10,
    /** The moment the app starts. */
    Start,
    /** The stage when the app ends. The stage where resources should be dropped. */
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
